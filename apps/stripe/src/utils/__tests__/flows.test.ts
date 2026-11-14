import { createHmac } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';

import { type StripeConfig } from 'src/types/stripe-config';
import { type PaymentRecord, type StripeDeps } from 'src/types/stripe-deps';
import { handleStripeWebhook } from 'src/utils/handle-stripe-webhook.util';
import { startCheckout } from 'src/utils/start-checkout.util';

const CONFIG: StripeConfig = { secretKey: 'sk_test', webhookSecret: 'whsec', paymentMethods: [], publicBaseUrl: 'https://acme.withtwenty.com' };
const PAYMENT: PaymentRecord = { id: 'pay-1', name: 'Tickets', status: 'OPEN', amountMicros: 210_000_000, currencyCode: 'EUR', payerEmail: 'ann@example.org', providerPaymentId: null };
const NOW = 1_800_000_000;

type MockDeps = { [K in keyof StripeDeps]: ReturnType<typeof vi.fn> & StripeDeps[K] };

const deps = (overrides: Partial<StripeDeps> = {}): MockDeps =>
  ({
    getPayment: vi.fn(async () => PAYMENT),
    updatePayment: vi.fn(async () => undefined),
    createCheckoutSession: vi.fn(async () => ({ id: 'cs_1', url: 'https://checkout.stripe.com/c/cs_1' })),
    fetchPaymentMethodType: vi.fn(async () => 'bancontact'),
    expireCheckoutSession: vi.fn(async () => undefined),
    ...overrides,
  }) as never;

describe('startCheckout', () => {
  it('opens a checkout for an open payment and marks it pending at Stripe', async () => {
    const d = deps();

    expect(await startCheckout(d, CONFIG, { paymentId: 'pay-1', locale: 'nl' })).toEqual({ ok: true, url: 'https://checkout.stripe.com/c/cs_1' });

    const params = d.createCheckoutSession.mock.calls[0][0] as URLSearchParams;

    expect(params.get('success_url')).toBe('https://acme.withtwenty.com/s/stripe/return?result=success&lang=nl');
    expect(params.get('customer_email')).toBe('ann@example.org');
    expect(d.updatePayment).toHaveBeenCalledWith('pay-1', { status: 'PENDING', provider: 'STRIPE', providerPaymentId: 'cs_1' });
  });

  it('uses the return addresses the caller gives', async () => {
    const d = deps();

    await startCheckout(d, CONFIG, { paymentId: 'pay-1', successUrl: 'https://site.test/ok', cancelUrl: 'https://site.test/no' });

    expect((d.createCheckoutSession.mock.calls[0][0] as URLSearchParams).get('cancel_url')).toBe('https://site.test/no');
  });

  it('refuses a paid, unknown or empty payment and works only with a key', async () => {
    expect(await startCheckout(deps({ getPayment: vi.fn(async () => ({ ...PAYMENT, status: 'PAID' })) }), CONFIG, { paymentId: 'pay-1' })).toMatchObject({ ok: false });
    expect(await startCheckout(deps({ getPayment: vi.fn(async () => null) }), CONFIG, { paymentId: 'x' })).toMatchObject({ ok: false });
    expect(await startCheckout(deps({ getPayment: vi.fn(async () => ({ ...PAYMENT, amountMicros: 0 })) }), CONFIG, { paymentId: 'pay-1' })).toMatchObject({ ok: false });
    expect(await startCheckout(deps(), { ...CONFIG, secretKey: null }, { paymentId: 'pay-1' })).toMatchObject({ ok: false });
  });

  it('closes the checkout that is still open before opening a new one, so it cannot be paid twice', async () => {
    const d = deps({ getPayment: vi.fn(async () => ({ ...PAYMENT, status: 'PENDING', providerPaymentId: 'cs_old' })) });

    expect(await startCheckout(d, CONFIG, { paymentId: 'pay-1' })).toMatchObject({ ok: true });
    expect(d.expireCheckoutSession).toHaveBeenCalledWith('cs_old');
    expect(d.expireCheckoutSession.mock.invocationCallOrder[0]).toBeLessThan(d.createCheckoutSession.mock.invocationCallOrder[0]);
  });

  it('opens no new checkout when the old one cannot be closed or a bank payment is on its way', async () => {
    const stuck = deps({
      getPayment: vi.fn(async () => ({ ...PAYMENT, status: 'PENDING', providerPaymentId: 'cs_old' })),
      expireCheckoutSession: vi.fn(async () => Promise.reject(new Error('already complete'))),
    });
    const debit = deps({ getPayment: vi.fn(async () => ({ ...PAYMENT, status: 'PENDING', providerPaymentId: 'pi_1' })) });

    expect(await startCheckout(stuck, CONFIG, { paymentId: 'pay-1' })).toMatchObject({ ok: false });
    expect(await startCheckout(debit, CONFIG, { paymentId: 'pay-1' })).toMatchObject({ ok: false });
    expect(stuck.createCheckoutSession).not.toHaveBeenCalled();
    expect(debit.createCheckoutSession).not.toHaveBeenCalled();
  });
});

describe('handleStripeWebhook', () => {
  const event = JSON.stringify({
    type: 'checkout.session.completed',
    created: NOW,
    data: { object: { id: 'cs_1', payment_status: 'paid', payment_intent: 'pi_1', metadata: { paymentId: 'pay-1' } } },
  });
  const signature = (payload: string) => `t=${NOW},v1=${createHmac('sha256', 'whsec').update(`${NOW}.${payload}`).digest('hex')}`;

  it('marks the payment paid with the method used', async () => {
    const d = deps();

    expect(await handleStripeWebhook(d, CONFIG, event, signature(event), NOW)).toEqual({ status: 200, handled: true });
    expect(d.updatePayment).toHaveBeenCalledWith('pay-1', {
      status: 'PAID',
      paidAt: new Date(NOW * 1000).toISOString(),
      provider: 'STRIPE',
      providerPaymentId: 'pi_1',
      method: 'BANCONTACT',
    });
  });

  it('refuses a bad signature and writes nothing', async () => {
    const d = deps();

    expect(await handleStripeWebhook(d, CONFIG, event, 't=1,v1=00', NOW)).toEqual({ status: 400, handled: false });
    expect(d.updatePayment).not.toHaveBeenCalled();
  });

  it('does not set a paid payment back, and still pays when the method cannot be read', async () => {
    const expired = JSON.stringify({ ...JSON.parse(event), type: 'checkout.session.expired' });
    const paid = deps({ getPayment: vi.fn(async () => ({ ...PAYMENT, status: 'PAID' })) });

    expect(await handleStripeWebhook(paid, CONFIG, expired, signature(expired), NOW)).toEqual({ status: 200, handled: false });
    expect(paid.updatePayment).not.toHaveBeenCalled();

    const noMethod = deps({ fetchPaymentMethodType: vi.fn(async () => Promise.reject(new Error('down'))) });

    await handleStripeWebhook(noMethod, CONFIG, event, signature(event), NOW);
    expect(noMethod.updatePayment.mock.calls[0][1]).toMatchObject({ status: 'PAID' });
  });

  it('ignores a failure or expiry of an older checkout, but records a payment from any', async () => {
    const newer = deps({ getPayment: vi.fn(async () => ({ ...PAYMENT, status: 'PENDING', providerPaymentId: 'cs_2' })) });
    const expired = JSON.stringify({ ...JSON.parse(event), type: 'checkout.session.expired' });

    expect(await handleStripeWebhook(newer, CONFIG, expired, signature(expired), NOW)).toEqual({ status: 200, handled: false });
    expect(await handleStripeWebhook(newer, CONFIG, event, signature(event), NOW)).toEqual({ status: 200, handled: true });
  });

  it('follows its own checkout once the bank payment is on its way', async () => {
    const debit = deps({ getPayment: vi.fn(async () => ({ ...PAYMENT, status: 'PENDING', providerPaymentId: 'pi_1' })) });
    const failed = JSON.stringify({ ...JSON.parse(event), type: 'checkout.session.async_payment_failed' });

    expect(await handleStripeWebhook(debit, CONFIG, failed, signature(failed), NOW)).toEqual({ status: 200, handled: true });
  });

  it('ignores a signed event without an object', async () => {
    const empty = JSON.stringify({ type: 'checkout.session.completed', created: NOW, data: {} });

    expect(await handleStripeWebhook(deps(), CONFIG, empty, signature(empty), NOW)).toEqual({ status: 200, handled: false });
  });

  it('ignores events for no known payment', async () => {
    const other = JSON.stringify({ type: 'customer.created', created: NOW, data: { object: {} } });

    expect(await handleStripeWebhook(deps(), CONFIG, other, signature(other), NOW)).toEqual({ status: 200, handled: false });
  });
});
