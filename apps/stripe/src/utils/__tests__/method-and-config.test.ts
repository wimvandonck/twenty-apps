import { describe, expect, it } from 'vitest';

import { readStripeConfig } from 'src/utils/read-stripe-config.util';
import { toPaymentMethod } from 'src/utils/to-payment-method.util';

describe('toPaymentMethod', () => {
  it('maps Stripe method types to the payment methods of the Nonprofit app', () => {
    expect(toPaymentMethod('card')).toBe('CREDIT_CARD');
    expect(toPaymentMethod('bancontact')).toBe('BANCONTACT');
    expect(toPaymentMethod('sepa_debit')).toBe('SEPA_DIRECT_DEBIT');
    expect(toPaymentMethod('paypal')).toBe('PAYPAL');
    expect(toPaymentMethod('ideal')).toBe('OTHER');
  });
});

describe('readStripeConfig', () => {
  it('reads the keys, the methods and the public address', () => {
    expect(
      readStripeConfig({
        STRIPE_SECRET_KEY: 'sk_test_1',
        STRIPE_WEBHOOK_SECRET: 'whsec_1',
        PAYMENT_METHODS: ' card, bancontact ,',
        TWENTY_FUNCTIONS_URL: 'https://acme.withtwenty.com/',
      }),
    ).toEqual({
      secretKey: 'sk_test_1',
      webhookSecret: 'whsec_1',
      paymentMethods: ['card', 'bancontact'],
      publicBaseUrl: 'https://acme.withtwenty.com',
    });
  });

  it('gives null keys when they are not set', () => {
    expect(readStripeConfig({ TWENTY_API_URL: 'https://x' })).toMatchObject({ secretKey: null, webhookSecret: null, paymentMethods: [] });
  });
});
