export type StripeConfig = {
  secretKey: string | null;
  webhookSecret: string | null;
  paymentMethods: string[];
  // The public address of the app's routes, which live under /s.
  publicBaseUrl: string;
};
