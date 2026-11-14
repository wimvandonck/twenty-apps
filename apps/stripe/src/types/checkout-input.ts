export type CheckoutInput = {
  paymentId: string;
  name: string;
  amountMicros: number;
  currencyCode: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  paymentMethods: string[];
  locale?: string;
};
