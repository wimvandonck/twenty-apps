import { type StripeConfig } from 'src/types/stripe-config';
import { type StripeDeps } from 'src/types/stripe-deps';
import { type StripeEvent } from 'src/types/stripe-event';
import { paymentPatchForEvent } from 'src/utils/payment-patch-for-event.util';
import { toPaymentMethod } from 'src/utils/to-payment-method.util';
import { verifyStripeSignature } from 'src/utils/verify-stripe-signature.util';

// Records the outcome of a Stripe Checkout on its payment. A paid payment is
// never set back by a late or repeated event.
export const handleStripeWebhook = async (
  deps: StripeDeps,
  config: StripeConfig,
  rawBody: string,
  signature: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<{ status: 200 | 400; handled: boolean }> => {
  if (!config.webhookSecret || !verifyStripeSignature(rawBody, signature, config.webhookSecret, nowSeconds)) {
    return { status: 400, handled: false };
  }

  let event: StripeEvent;

  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return { status: 400, handled: false };
  }

  const change = paymentPatchForEvent(event);
  const payment = change ? await deps.getPayment(change.paymentId) : null;

  if (!change || !payment || payment.status === 'PAID' || payment.status === 'REFUNDED') {
    return { status: 200, handled: false };
  }

  // Only the current checkout changes a payment that is not paid: a late
  // expiry of an older one must not make it payable again. Money received
  // through any checkout is recorded.
  const isCurrent =
    payment.providerPaymentId === null ||
    payment.providerPaymentId === change.sessionId ||
    payment.providerPaymentId === change.paymentIntentId;

  if (!isCurrent && change.patch.status !== 'PAID') {
    return { status: 200, handled: false };
  }

  const patch = { ...change.patch };

  if (patch.status === 'PAID' && change.paymentIntentId) {
    const methodType = await deps.fetchPaymentMethodType(change.paymentIntentId).catch(() => null);

    if (methodType) {
      patch.method = toPaymentMethod(methodType);
    }
  }

  await deps.updatePayment(payment.id, patch);

  return { status: 200, handled: true };
};
