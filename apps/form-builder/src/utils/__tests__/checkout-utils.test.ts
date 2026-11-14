import { describe, expect, it, vi } from 'vitest';

import { type FormPayment } from 'src/types/form-payment';
import { startOnlinePayment } from 'src/utils/start-online-payment.util';

const PAYMENT: FormPayment = {
  currencyCode: 'EUR',
  amountFields: [],
  totalFields: [],
  createPayment: true,
  checkout: 'STRIPE',
  payerRecordKey: null,
  paymentLinks: [],
};

describe('startOnlinePayment', () => {
  it('opens a Stripe checkout for the payment of the submission', async () => {
    const api = { start: vi.fn(async () => ({ url: 'https://checkout.stripe.com/c/1' })) };

    expect(await startOnlinePayment(api, PAYMENT, { ok: true, paymentId: 'pay-1', totalMicros: 1 }, 'nl')).toBe('https://checkout.stripe.com/c/1');
    expect(api.start).toHaveBeenCalledWith({ paymentId: 'pay-1', locale: 'nl' });
  });

  it('does nothing without online payment, without a payment, or when Stripe fails', async () => {
    const api = { start: vi.fn(async () => Promise.reject(new Error('down'))) };

    expect(await startOnlinePayment(api, { ...PAYMENT, checkout: 'NONE' }, { ok: true, paymentId: 'pay-1' }, 'nl')).toBeNull();
    expect(await startOnlinePayment(api, PAYMENT, { ok: true }, 'nl')).toBeNull();
    expect(await startOnlinePayment(api, null, { ok: true, paymentId: 'pay-1' }, 'nl')).toBeNull();
    expect(await startOnlinePayment(api, PAYMENT, { ok: true, paymentId: 'pay-1' }, 'nl')).toBeNull();
  });
});
