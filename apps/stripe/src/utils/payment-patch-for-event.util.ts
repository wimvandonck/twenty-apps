import { type StripeEvent } from 'src/types/stripe-event';

export type PaymentPatch = {
  paymentId: string;
  patch: Record<string, string>;
  // To look up the method used, once paid.
  paymentIntentId: string | null;
};

const STATUS_BY_EVENT: Record<string, string> = {
  'checkout.session.async_payment_succeeded': 'PAID',
  'checkout.session.async_payment_failed': 'FAILED',
  'checkout.session.expired': 'EXPIRED',
};

// What a Checkout Session event means for the payment it belongs to. A
// completed checkout is paid at once, or pending for methods that confirm
// later, such as SEPA direct debit.
export const paymentPatchForEvent = (event: StripeEvent): PaymentPatch | null => {
  const session = event.data.object;
  const paymentId = (session.metadata as Record<string, unknown> | undefined)?.paymentId;

  if (!event.type.startsWith('checkout.session.') || typeof paymentId !== 'string' || paymentId === '') {
    return null;
  }

  const status =
    event.type === 'checkout.session.completed'
      ? session.payment_status === 'unpaid'
        ? 'PENDING'
        : 'PAID'
      : STATUS_BY_EVENT[event.type];

  if (!status) {
    return null;
  }

  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;

  return {
    paymentId,
    patch: {
      status,
      ...(status === 'PAID' ? { paidAt: new Date(event.created * 1000).toISOString() } : {}),
      provider: 'STRIPE',
      ...(paymentIntentId ? { providerPaymentId: paymentIntentId } : {}),
    },
    paymentIntentId,
  };
};
