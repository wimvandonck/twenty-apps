import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineLogicFunction } from 'twenty-sdk/define';
import { Response, type RoutePayload } from 'twenty-sdk/logic-function';

import { createCheckoutApi } from 'src/twenty-client/create-checkout-api';
import { createConsentApi } from 'src/twenty-client/create-consent-api';
import { createRecordApi } from 'src/twenty-client/create-record-api';
import { createRecordByIdLoader } from 'src/twenty-client/create-record-by-id-loader';
import { createRelationRecordLoader } from 'src/twenty-client/create-relation-record-loader';
import { fetchPublishedForm } from 'src/twenty-client/fetch-published-form';
import { type SubmissionOptIns, type SubmissionValues } from 'src/types/submission-values';
import { addChosenRelations } from 'src/utils/add-chosen-relations.util';
import { getPublicFormMessages } from 'src/utils/get-public-form-messages.util';
import { loadPickerChoices } from 'src/utils/load-picker-choices.util';
import { loadRelationOptions } from 'src/utils/load-relation-options.util';
import { processSubmission } from 'src/utils/process-submission.util';
import { startOnlinePayment } from 'src/utils/start-online-payment.util';

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
    picks?: unknown;
    website?: unknown;
    language?: unknown;
  };
  const { messages } = getPublicFormMessages(
    typeof body.language === 'string' ? body.language : undefined,
    event.headers?.['accept-language'],
  );
  const published = await fetchPublishedForm(client, event.pathParameters?.formId);
  // A relation is checked against the records that exist now.
  const definition =
    published === null ? null : await loadRelationOptions(published, createRelationRecordLoader(client));

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
  // A record outside the listed choices may still be chosen or fixed, as long as it exists.
  const checked = await addChosenRelations(definition, values, createRecordByIdLoader(client));
  const result = await processSubmission(checked, values, createRecordApi(client), messages, optIns, {
    consentApi: createConsentApi(client),
    // Prices come from the records in Twenty, never from the browser.
    pickerChoices: await loadPickerChoices(definition, createRelationRecordLoader(client)),
    picks: (typeof body.picks === 'object' && body.picks !== null ? body.picks : {}) as Record<string, Record<string, unknown>>,
    consents,
    language: typeof body.language === 'string' ? body.language : undefined,
    visitor: { ...(ipAddress ? { ipAddress } : {}), ...(userAgent ? { userAgent } : {}) },
  });

  if (!result.ok) {
    return json(result.status, { ok: false, errors: result.errors });
  }

  const redirectUrl = await startOnlinePayment(
    createCheckoutApi(client),
    definition.payment,
    result,
    typeof body.language === 'string' ? body.language : undefined,
  );

  return json(200, redirectUrl ? { ok: true, redirectUrl } : { ok: true });
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
