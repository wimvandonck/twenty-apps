import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';

import { createRecordStore } from 'src/twenty-client/create-record-store';
import { buildPreferenceGroups } from 'src/utils/build-preference-groups.util';
import { getPublicMessages } from 'src/utils/get-public-messages.util';
import { htmlResponse } from 'src/utils/html-response.util';
import { parsePostedForm } from 'src/utils/parse-posted-form.util';
import { readAppConfigOrNull } from 'src/utils/read-app-config.util';
import { renderInvalidLinkHtml } from 'src/utils/render-invalid-link-html.util';
import { renderPreferencesHtml } from 'src/utils/render-preferences-html.util';
import { requestContextFrom } from 'src/utils/request-context-from.util';
import { savePreferences } from 'src/utils/save-preferences.util';

// Saves the preferences page and shows it again with a notice.
const handler = async (event: RoutePayload) => {
  const { locale, messages } = getPublicMessages(event.queryStringParameters?.lang, event.headers?.['accept-language']);
  const config = readAppConfigOrNull();

  if (!config) {
    return htmlResponse(503, renderInvalidLinkHtml(messages, locale));
  }
  const posted = parsePostedForm(event);
  const result = await savePreferences(createRecordStore(), config, posted, requestContextFrom(event.headers));

  if (!result.ok) {
    return htmlResponse(400, renderInvalidLinkHtml(messages, locale));
  }

  return htmlResponse(
    200,
    renderPreferencesHtml({
      messages,
      locale,
      organizationName: config.organizationName,
      firstName: result.data.firstName,
      groups: buildPreferenceGroups(result.data),
      token: posted.token,
      saved: true,
    }),
  );
};

export default defineLogicFunction({
  universalIdentifier: 'b7fdfddf-cd1f-4859-99dc-394b4b0ba765',
  name: 'save-preferences',
  description: 'Saves the choices made on the email preferences page',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/consents/preferences',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['accept-language', 'user-agent', 'x-forwarded-for', 'content-type'],
  },
});
