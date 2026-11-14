import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineLogicFunction } from 'twenty-sdk/define';
import { Response, type RoutePayload } from 'twenty-sdk/logic-function';

import { createConsentApi } from 'src/twenty-client/create-consent-api';
import { createRecordApi } from 'src/twenty-client/create-record-api';
import { fetchPublishedForm } from 'src/twenty-client/fetch-published-form';
import { type SubmissionOptIns, type SubmissionValues } from 'src/types/submission-values';
import { getPublicFormMessages } from 'src/utils/get-public-form-messages.util';
import { processSubmission } from 'src/utils/process-submission.util';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const handler = async (event: RoutePayload) => {
  const client = new RestApiClient();
  const body = (event.body ?? {}) as {
    values?: unknown;
    lists?: unknown;
    consents?: unknown;
    website?: unknown;
    language?: unknown;
  };
  const { messages } = getPublicFormMessages(
    typeof body.language === 'string' ? body.language : undefined,
    event.headers?.['accept-language'],
  );
  const definition = await fetchPublishedForm(client, event.pathParameters?.formId);

  if (definition === null) {
    return json(404, { ok: false, errors: [messages.unavailableText] });
  }

  // Bots fill the hidden "website" input; pretend it worked and write nothing.
  if (typeof body.website === 'string' && body.website !== '') {
    return json(200, { ok: true });
  }

  const values = (
    typeof body.values === 'object' && body.values !== null ? body.values : {}
  ) as SubmissionValues;
  const optIns = (typeof body.lists === 'object' && body.lists !== null ? body.lists : {}) as SubmissionOptIns;
  const consents = (
    typeof body.consents === 'object' && body.consents !== null ? body.consents : {}
  ) as SubmissionOptIns;
  const ipAddress = event.headers?.['x-forwarded-for']?.split(',')[0]?.trim();
  const userAgent = event.headers?.['user-agent']?.slice(0, 500);
  const result = await processSubmission(definition, values, createRecordApi(client), messages, optIns, {
    consentApi: createConsentApi(client),
    consents,
    language: typeof body.language === 'string' ? body.language : undefined,
    visitor: { ...(ipAddress ? { ipAddress } : {}), ...(userAgent ? { userAgent } : {}) },
  });

  return result.ok
    ? json(200, { ok: true })
    : json(result.status, { ok: false, errors: result.errors });
};

export default defineLogicFunction({
  universalIdentifier: '5c4351a6-098d-4aed-a04d-a0be67e0ee78',
  name: 'submit-form',
  description: 'Receives a public form submission and writes its records',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/forms/:formId',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['accept-language', 'user-agent', 'x-forwarded-for'],
  },
});
