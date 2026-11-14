import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';

import { createRecordStore } from 'src/twenty-client/create-record-store';
import { buildPreferencesUrl } from 'src/utils/build-preferences-url.util';
import { confirmSubmission } from 'src/utils/confirm-submission.util';
import { getPublicMessages } from 'src/utils/get-public-messages.util';
import { htmlResponse } from 'src/utils/html-response.util';
import { readAppConfig } from 'src/utils/read-app-config.util';
import { renderConfirmedHtml } from 'src/utils/render-confirmed-html.util';
import { renderInvalidLinkHtml } from 'src/utils/render-invalid-link-html.util';
import { requestContextFrom } from 'src/utils/request-context-from.util';

// The link in the confirmation mail.
const handler = async (event: RoutePayload) => {
  const { locale, messages } = getPublicMessages(event.queryStringParameters?.lang, event.headers?.['accept-language']);
  const config = readAppConfig();
  const result = await confirmSubmission(
    createRecordStore(),
    config,
    event.queryStringParameters?.token ?? '',
    requestContextFrom(event.headers),
  );

  if (!result.ok) {
    return htmlResponse(400, renderInvalidLinkHtml(messages, locale));
  }

  return htmlResponse(
    200,
    renderConfirmedHtml(
      messages,
      locale,
      result.emailTypeNames,
      buildPreferencesUrl(config.publicBaseUrl, result.personId, config.signingSecret),
    ),
  );
};

export default defineLogicFunction({
  universalIdentifier: 'f4608804-f982-493a-9c77-6c96abf891e5',
  name: 'confirm-consent',
  description: 'Confirms the consents of a form submission from the link in the confirmation mail',
  timeoutSeconds: 20,
  handler,
  httpRouteTriggerSettings: {
    path: '/consents/confirm',
    httpMethod: 'GET',
    isAuthRequired: false,
    forwardedRequestHeaders: ['accept-language', 'user-agent', 'x-forwarded-for'],
  },
});
