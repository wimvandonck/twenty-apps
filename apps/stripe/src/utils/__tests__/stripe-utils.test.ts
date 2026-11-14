import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { buildCheckoutParams } from 'src/utils/build-checkout-params.util';
import { paymentPatchForEvent } from 'src/utils/payment-patch-for-event.util';
import { toMinorUnits } from 'src/utils/to-minor-units.util';
import { verifyStripeSignature } from 'src/utils/verify-stripe-signature.util';

const SECRET = 'whsec_test';
const NOW = 1_800_000_000;
const sign = (payload: string, timestamp: number, secret = SECRET) =>
  `t=${timestamp},v1=${createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex')},v0=ignored`;

describe('verifyStripeSignature', () => {
  const payload = '{"id":"evt_1"}';

  it('accepts a valid signature within five minutes', () => {
    expect(verifyStripeSignature(payload, sign(payload, NOW - 60), SECRET, NOW)).toBe(true);
  });

  it('refuses a changed body, another secret, an old timestamp and missing parts', () => {
    expect(verifyStripeSignature('{"id":"evt_2"}', sign(payload, NOW), SECRET, NOW)).toBe(false);
    expect(verifyStripeSignature(payload, sign(payload, NOW, 'other'), SECRET, NOW)).toBe(false);
    expect(verifyStripeSignature(payload, sign(payload, NOW - 301), SECRET, NOW)).toBe(false);
    expect(verifyStripeSignature(payload, 't=1', SECRET, NOW)).toBe(false);
    expect(verifyStripeSignature(payload, '', SECRET, NOW)).toBe(false);
  });
});

describe('toMinorUnits', () => {
  it('converts micros to cents, and to whole units for zero-decimal currencies', () => {
    expect(toMinorUnits(15_500_000, 'EUR')).toBe(1550);
    expect(toMinorUnits(1_000_000, 'JPY')).toBe(1);
  });
});

describe('buildCheckoutParams', () => {
  it('describes one line for the whole payment and remembers the payment', () => {
    const params = buildCheckoutParams({
      paymentId: 'pay-1',
      name: 'Benefietdiner',
      amountMicros: 210_000_000,
      currencyCode: 'EUR',
      successUrl: 'https://x.test/ok',
      cancelUrl: 'https://x.test/cancel',
      customerEmail: 'ann@example.org',
      paymentMethods: ['card', 'bancontact'],
      locale: 'nl',
    });

    expect(Object.fromEntries(params)).toMatchObject({
      mode: 'payment',
      'line_items[0][price_data][currency]': 'eur',
      'line_items[0][price_data][unit_amount]': '21000',
      'line_items[0][price_data][product_data][name]': 'Benefietdiner',
      'line_items[0][quantity]': '1',
      success_url: 'https://x.test/ok',
      cancel_url: 'https://x.test/cancel',
      client_reference_id: 'pay-1',
      'metadata[paymentId]': 'pay-1',
      'payment_intent_data[metadata][paymentId]': 'pay-1',
      customer_email: 'ann@example.org',
      locale: 'nl',
    });
    expect(params.getAll('payment_method_types[]')).toEqual(['card', 'bancontact']);
  });

  it('leaves out what is not known', () => {
    const params = buildCheckoutParams({
      paymentId: 'pay-1',
      name: '',
      amountMicros: 1_000_000,
      currencyCode: 'EUR',
      successUrl: 'https://x.test/ok',
      cancelUrl: 'https://x.test/cancel',
      paymentMethods: [],
    });

    expect(params.has('customer_email')).toBe(false);
    expect(params.has('payment_method_types[]')).toBe(false);
    expect(params.get('line_items[0][price_data][product_data][name]')).toBe('Payment');
  });
});

describe('paymentPatchForEvent', () => {
  const session = (overrides: Record<string, unknown>) => ({
    id: 'cs_1',
    payment_status: 'paid',
    metadata: { paymentId: 'pay-1' },
    payment_intent: 'pi_1',
    ...overrides,
  });

  it('marks a paid checkout as paid with the time it happened', () => {
    expect(paymentPatchForEvent({ type: 'checkout.session.completed', created: NOW, data: { object: session({}) } })).toEqual({
      paymentId: 'pay-1',
      patch: { status: 'PAID', paidAt: new Date(NOW * 1000).toISOString(), provider: 'STRIPE', providerPaymentId: 'pi_1' },
      paymentIntentId: 'pi_1',
      sessionId: 'cs_1',
    });
  });

  it('waits for a delayed method and follows its outcome', () => {
    expect(
      paymentPatchForEvent({ type: 'checkout.session.completed', created: NOW, data: { object: session({ payment_status: 'unpaid' }) } })
        ?.patch.status,
    ).toBe('PENDING');
    expect(paymentPatchForEvent({ type: 'checkout.session.async_payment_succeeded', created: NOW, data: { object: session({}) } })?.patch.status).toBe(
      'PAID',
    );
    expect(paymentPatchForEvent({ type: 'checkout.session.async_payment_failed', created: NOW, data: { object: session({}) } })?.patch.status).toBe(
      'FAILED',
    );
    expect(paymentPatchForEvent({ type: 'checkout.session.expired', created: NOW, data: { object: session({}) } })?.patch.status).toBe('EXPIRED');
  });

  it('ignores other events and sessions without a payment', () => {
    expect(paymentPatchForEvent({ type: 'customer.created', created: NOW, data: { object: {} } })).toBeNull();
    expect(paymentPatchForEvent({ type: 'checkout.session.completed', created: NOW, data: { object: session({ metadata: {} }) } })).toBeNull();
  });
});
