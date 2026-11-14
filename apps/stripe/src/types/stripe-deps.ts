export type PaymentRecord = {
  id: string;
  name: string;
  status: string;
  amountMicros: number | null;
  currencyCode: string | null;
  payerEmail: string | null;
  // The checkout session (cs_…) while it is open, then the payment intent (pi_…).
  providerPaymentId: string | null;
};

// What the flows need from Twenty and Stripe, so they can be tested without either.
export type StripeDeps = {
  getPayment: (id: string) => Promise<PaymentRecord | null>;
  updatePayment: (id: string, patch: Record<string, string>) => Promise<void>;
  createCheckoutSession: (params: URLSearchParams) => Promise<{ id: string; url: string }>;
  fetchPaymentMethodType: (paymentIntentId: string) => Promise<string | null>;
  // Rejects when the session can no longer be closed, for example once paid.
  expireCheckoutSession: (sessionId: string) => Promise<void>;
};
