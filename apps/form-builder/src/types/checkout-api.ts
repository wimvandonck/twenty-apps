// Opens an online payment through the Stripe app, so forms can be tested without it.
export type CheckoutApi = {
  start: (request: { paymentId: string; locale?: string }) => Promise<{ url: string } | null>;
};
