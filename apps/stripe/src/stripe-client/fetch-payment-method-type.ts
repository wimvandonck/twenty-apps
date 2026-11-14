import { stripeRequest } from 'src/stripe-client/stripe-request';

type PaymentIntent = { latest_charge?: { payment_method_details?: { type?: string } } | string | null };

// The method a payment intent was paid with, such as "bancontact", or null.
export const fetchPaymentMethodType = async (secretKey: string, paymentIntentId: string): Promise<string | null> => {
  const intent = await stripeRequest<PaymentIntent>(
    secretKey,
    'GET',
    `/payment_intents/${encodeURIComponent(paymentIntentId)}?expand[]=latest_charge`,
  );

  return typeof intent.latest_charge === 'object' ? (intent.latest_charge?.payment_method_details?.type ?? null) : null;
};
