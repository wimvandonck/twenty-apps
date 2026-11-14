import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';

import { createStripeDeps } from 'src/twenty-client/create-stripe-deps';
import { jsonResponse } from 'src/utils/json-response.util';
import { readStripeConfig } from 'src/utils/read-stripe-config.util';
import { startCheckout } from 'src/utils/start-checkout.util';

const text = (value: unknown) => (typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined);

// Other apps, such as the form builder, open a Stripe Checkout for a payment here.
const handler = async (event: RoutePayload) => {
  const body = (event.body ?? {}) as Record<string, unknown>;
  const paymentId = text(body.paymentId);

  if (!paymentId) {
    return jsonResponse(400, { ok: false, error: 'paymentId is required' });
  }

  const config = readStripeConfig();

  try {
    const result = await startCheckout(createStripeDeps(config), config, {
      paymentId,
      successUrl: text(body.successUrl),
      cancelUrl: text(body.cancelUrl),
      locale: text(body.locale),
    });

    return jsonResponse(result.ok ? 200 : 400, result);
  } catch (error) {
    console.error('Stripe checkout failed', error);

    return jsonResponse(502, { ok: false, error: 'Stripe could not open a checkout' });
  }
};

export default defineLogicFunction({
  universalIdentifier: 'c3709885-1b93-4a38-9a3a-502aa2d387aa',
  name: 'create-checkout',
  description: 'Opens a Stripe Checkout for a payment and returns its address',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: { path: '/stripe/checkout', httpMethod: 'POST', isAuthRequired: true },
});
