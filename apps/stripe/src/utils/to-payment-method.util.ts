const METHODS: Record<string, string> = {
  card: 'CREDIT_CARD',
  bancontact: 'BANCONTACT',
  sepa_debit: 'SEPA_DIRECT_DEBIT',
  paypal: 'PAYPAL',
};

// The payment method of the Nonprofit app for a Stripe method type.
export const toPaymentMethod = (stripeType: string): string => METHODS[stripeType] ?? 'OTHER';
