import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';

import { createRecordStore } from 'src/twenty-client/create-record-store';
import { fetchPreferenceData } from 'src/twenty-client/fetch-preference-data';
import { buildPreferenceGroups } from 'src/utils/build-preference-groups.util';
import { getPublicMessages } from 'src/utils/get-public-messages.util';
import { htmlResponse } from 'src/utils/html-response.util';
import { readAppConfigOrNull } from 'src/utils/read-app-config.util';
import { renderInvalidLinkHtml } from 'src/utils/render-invalid-link-html.util';
import { renderPreferencesHtml } from 'src/utils/render-preferences-html.util';
import { verifyToken } from 'src/utils/verify-token.util';

// The personal preferences page.
const handler = async (event: RoutePayload) => {
  const { locale, messages } = getPublicMessages(event.queryStringParameters?.lang, event.headers?.['accept-language']);
  const config = readAppConfigOrNull();

  if (!config) {
    return htmlResponse(503, renderInvalidLinkHtml(messages, locale));
  }
  const token = event.queryStringParameters?.token ?? '';
  const payload = verifyToken(token, config.signingSecret, Date.now());
  const data = payload?.kind === 'preferences' ? await fetchPreferenceData(createRecordStore(), payload.personId) : null;

  if (!data) {
    return htmlResponse(400, renderInvalidLinkHtml(messages, locale));
  }

  return htmlResponse(
    200,
    renderPreferencesHtml({
      messages,
      locale,
      organizationName: config.organizationName,
      firstName: data.firstName,
      groups: buildPreferenceGroups(data),
      token,
      saved: false,
    }),
  );
};

export default defineLogicFunction({
  universalIdentifier: 'a130b65d-bac1-497d-ac1f-e278ddee30f0',
  name: 'render-preferences',
  description: 'Serves the personal email preferences page',
  timeoutSeconds: 20,
  handler,
  httpRouteTriggerSettings: {
    path: '/consents/preferences',
    httpMethod: 'GET',
    isAuthRequired: false,
    forwardedRequestHeaders: ['accept-language'],
  },
});
