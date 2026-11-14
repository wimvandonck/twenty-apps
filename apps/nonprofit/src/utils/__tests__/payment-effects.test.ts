import { describe, expect, it } from 'vitest';

import { paymentEffects } from 'src/utils/payment-effects.util';

describe('paymentEffects', () => {
  it('marks registrations paid, activates pending memberships and pays open orders', () => {
    expect(paymentEffects('PAID')).toEqual({
      registrationPaymentStatus: 'PAID',
      membership: { from: ['PENDING'], to: 'ACTIVE' },
      order: { from: ['OPEN'], to: 'PAID' },
    });
  });

  it('marks registrations refunded and refunds orders', () => {
    expect(paymentEffects('REFUNDED')).toEqual({
      registrationPaymentStatus: 'REFUNDED',
      membership: { from: ['PENDING', 'ACTIVE'], to: 'CANCELLED' },
      order: { from: ['OPEN', 'PAID'], to: 'REFUNDED' },
    });
  });

  it('keeps registrations unpaid while a payment is not paid', () => {
    for (const status of ['OPEN', 'PENDING', 'FAILED', 'EXPIRED', 'CANCELLED']) {
      expect(paymentEffects(status)).toEqual({ registrationPaymentStatus: 'UNPAID', membership: null, order: null });
    }
  });
});
