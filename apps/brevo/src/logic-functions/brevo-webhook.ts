import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';

import { createTwentyDeps } from 'src/twenty-client/create-twenty-deps';
import { handleUnsubscribe } from 'src/utils/handle-unsubscribe.util';
import { isValidWebhookToken } from 'src/utils/is-valid-webhook-token.util';
import { jsonResponse } from 'src/utils/json-response.util';
import { parseUnsubscribe } from 'src/utils/parse-unsubscribe.util';
import { readBrevoConfig } from 'src/utils/read-brevo-config.util';

// Brevo calls this when someone unsubscribes from a campaign.
const handler = async (event: RoutePayload) => {
  if (!isValidWebhookToken(event.queryStringParameters?.token, readBrevoConfig().webhookToken)) {
    return jsonResponse(401, { ok: false });
  }

  const unsubscribe = parseUnsubscribe(event.body);
  const result = unsubscribe ? await handleUnsubscribe(createTwentyDeps(), unsubscribe) : { handled: false };

  return jsonResponse(200, { ok: true, ...result });
};

export default defineLogicFunction({
  universalIdentifier: 'f80c0959-67d6-4386-9e1f-77b33510816d',
  name: 'brevo-webhook',
  description: 'Withdraws consents and list memberships of people who unsubscribe in Brevo',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: { path: '/brevo/webhook', httpMethod: 'POST', isAuthRequired: false },
});
