import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';

import { createStripeDeps } from 'src/twenty-client/create-stripe-deps';
import { handleStripeWebhook } from 'src/utils/handle-stripe-webhook.util';
import { jsonResponse } from 'src/utils/json-response.util';
import { readStripeConfig } from 'src/utils/read-stripe-config.util';

// The exact bytes Stripe signed.
const rawBodyOf = (event: RoutePayload): string => {
  if (typeof event.rawBody === 'string') {
    return event.rawBody;
  }

  if (typeof event.body === 'string') {
    return event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  }

  return JSON.stringify(event.body ?? {});
};

// Stripe calls this when a checkout is paid, fails or expires.
const handler = async (event: RoutePayload) => {
  const config = readStripeConfig();
  const result = await handleStripeWebhook(
    createStripeDeps(config),
    config,
    rawBodyOf(event),
    event.headers?.['stripe-signature'] ?? '',
  );

  return jsonResponse(result.status, { received: result.status === 200, handled: result.handled });
};

export default defineLogicFunction({
  universalIdentifier: '5cc4b480-4daa-4166-b941-4374138912de',
  name: 'stripe-webhook',
  description: 'Records the outcome of Stripe Checkouts on their payments',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/stripe/webhook',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['stripe-signature'],
  },
});
