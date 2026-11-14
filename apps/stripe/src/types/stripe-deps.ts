export type PaymentRecord = {
  id: string;
  name: string;
  status: string;
  amountMicros: number | null;
  currencyCode: string | null;
  payerEmail: string | null;
};

// What the flows need from Twenty and Stripe, so they can be tested without either.
export type StripeDeps = {
  getPayment: (id: string) => Promise<PaymentRecord | null>;
  updatePayment: (id: string, patch: Record<string, string>) => Promise<void>;
  createCheckoutSession: (params: URLSearchParams) => Promise<{ id: string; url: string }>;
  fetchPaymentMethodType: (paymentIntentId: string) => Promise<string | null>;
};
