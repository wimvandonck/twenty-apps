import { type StripeConfig } from 'src/types/stripe-config';
import { type StripeDeps } from 'src/types/stripe-deps';
import { buildCheckoutParams } from 'src/utils/build-checkout-params.util';

export type StartCheckoutInput = { paymentId: string; successUrl?: string; cancelUrl?: string; locale?: string };

export type StartCheckoutResult = { ok: true; url: string } | { ok: false; error: string };

const PAYABLE = ['OPEN', 'PENDING', 'FAILED', 'EXPIRED'];

// Opens a Stripe Checkout for an unpaid payment and marks the payment as
// pending at Stripe. The webhook records the outcome.
export const startCheckout = async (
  deps: StripeDeps,
  config: StripeConfig,
  input: StartCheckoutInput,
): Promise<StartCheckoutResult> => {
  if (!config.secretKey) {
    return { ok: false, error: 'The Stripe secret key is not set' };
  }

  const payment = await deps.getPayment(input.paymentId);

  if (!payment || !PAYABLE.includes(payment.status)) {
    return { ok: false, error: 'This payment cannot be paid online' };
  }

  if (!payment.amountMicros || payment.amountMicros <= 0 || !payment.currencyCode) {
    return { ok: false, error: 'This payment has no amount' };
  }

  const lang = input.locale ? `&lang=${encodeURIComponent(input.locale)}` : '';
  const session = await deps.createCheckoutSession(
    buildCheckoutParams({
      paymentId: payment.id,
      name: payment.name,
      amountMicros: payment.amountMicros,
      currencyCode: payment.currencyCode,
      successUrl: input.successUrl ?? `${config.publicBaseUrl}/s/stripe/return?result=success${lang}`,
      cancelUrl: input.cancelUrl ?? `${config.publicBaseUrl}/s/stripe/return?result=cancel${lang}`,
      ...(payment.payerEmail ? { customerEmail: payment.payerEmail } : {}),
      paymentMethods: config.paymentMethods,
      ...(input.locale ? { locale: input.locale.split('-')[0] } : {}),
    }),
  );

  await deps.updatePayment(payment.id, { status: 'PENDING', provider: 'STRIPE', providerPaymentId: session.id });

  return { ok: true, url: session.url };
};
