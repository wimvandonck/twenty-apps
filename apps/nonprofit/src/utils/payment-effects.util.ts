export type StatusChange = { from: string[]; to: string } | null;

export type PaymentEffects = {
  // Registrations keep a copy of their payment's status, to filter on.
  registrationPaymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  membership: StatusChange;
  order: StatusChange;
};

// What a payment's status means for the registrations, memberships and
// orders it pays for. Only records still in an earlier state follow, so a
// status set by hand afterwards (shipped, completed) is never undone.
export const paymentEffects = (paymentStatus: string): PaymentEffects => {
  if (paymentStatus === 'PAID') {
    return {
      registrationPaymentStatus: 'PAID',
      membership: { from: ['PENDING'], to: 'ACTIVE' },
      order: { from: ['OPEN'], to: 'PAID' },
    };
  }

  if (paymentStatus === 'REFUNDED') {
    return {
      registrationPaymentStatus: 'REFUNDED',
      membership: { from: ['PENDING', 'ACTIVE'], to: 'CANCELLED' },
      order: { from: ['OPEN', 'PAID'], to: 'REFUNDED' },
    };
  }

  return { registrationPaymentStatus: 'UNPAID', membership: null, order: null };
};
