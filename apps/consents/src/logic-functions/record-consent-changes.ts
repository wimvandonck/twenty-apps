import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';

import { createRecordStore } from 'src/twenty-client/create-record-store';
import { findMissingTargets } from 'src/utils/find-missing-targets.util';
import { jsonResponse } from 'src/utils/json-response.util';
import { parseChangeRequest } from 'src/utils/parse-change-request.util';
import { readAppConfigOrNull } from 'src/utils/read-app-config.util';
import { recordChanges } from 'src/utils/record-changes.util';
import { requestContextFrom } from 'src/utils/request-context-from.util';

// Other apps, such as the form builder, record consents through this route.
const handler = async (event: RoutePayload) => {
  const parsed = parseChangeRequest(event.body);

  if (!parsed.ok) {
    return jsonResponse(400, { ok: false, errors: parsed.errors });
  }

  const body = (event.body ?? {}) as { ipAddress?: unknown; userAgent?: unknown };
  // A caller relaying a visitor's request passes on the visitor's details.
  const context = {
    ...requestContextFrom(event.headers),
    ...(typeof body.ipAddress === 'string' && body.ipAddress !== '' ? { ipAddress: body.ipAddress } : {}),
    ...(typeof body.userAgent === 'string' && body.userAgent !== '' ? { userAgent: body.userAgent.slice(0, 500) } : {}),
  };
  const config = readAppConfigOrNull();

  if (!config) {
    return jsonResponse(503, { ok: false, errors: ['The Consents app has no signing secret yet'] });
  }

  const store = createRecordStore();
  const missing = await findMissingTargets(store, parsed.value);

  if (missing.length > 0) {
    return jsonResponse(400, { ok: false, errors: missing });
  }

  const result = await recordChanges(store, config, parsed.value, context);

  return jsonResponse(200, { ok: true, ...result });
};

export default defineLogicFunction({
  universalIdentifier: 'e5026f30-7114-49e1-a63c-31fb7864ae3b',
  name: 'record-consent-changes',
  description: 'Records consent changes for a person, and sends the confirmation mail for new requests',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/consents/changes',
    httpMethod: 'POST',
    isAuthRequired: true,
    forwardedRequestHeaders: ['user-agent', 'x-forwarded-for'],
  },
});
