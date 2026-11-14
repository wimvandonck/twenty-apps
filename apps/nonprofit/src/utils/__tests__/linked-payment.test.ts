import { describe, expect, it } from 'vitest';

import { linkedPaymentPatch } from 'src/utils/linked-payment-patch.util';

describe('linkedPaymentPatch', () => {
  it('marks a registration unpaid when linked to an open payment', () => {
    expect(linkedPaymentPatch('registrations', { paymentStatus: 'NOT_REQUIRED' }, 'OPEN')).toEqual({ paymentStatus: 'UNPAID' });
  });

  it('marks it paid when the payment is paid already, and changes nothing when it matches', () => {
    expect(linkedPaymentPatch('registrations', { paymentStatus: 'UNPAID' }, 'PAID')).toEqual({ paymentStatus: 'PAID' });
    expect(linkedPaymentPatch('registrations', { paymentStatus: 'PAID' }, 'PAID')).toEqual({});
  });

  it('activates a pending membership and pays an open order linked to a paid payment', () => {
    expect(linkedPaymentPatch('memberships', { status: 'PENDING' }, 'PAID')).toEqual({ status: 'ACTIVE' });
    expect(linkedPaymentPatch('orders', { status: 'OPEN' }, 'PAID')).toEqual({ status: 'PAID' });
    expect(linkedPaymentPatch('memberships', { status: 'PENDING' }, 'OPEN')).toEqual({});
  });
});
