import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';

import { getPublicMessages } from 'src/utils/get-public-messages.util';
import { htmlResponse } from 'src/utils/html-response.util';
import { readAppConfigOrNull } from 'src/utils/read-app-config.util';
import { renderConfirmPromptHtml } from 'src/utils/render-confirm-prompt-html.util';
import { renderInvalidLinkHtml } from 'src/utils/render-invalid-link-html.util';
import { verifyToken } from 'src/utils/verify-token.util';

// The link in the confirmation mail. It shows a button; the click confirms.
const handler = async (event: RoutePayload) => {
  const { locale, messages } = getPublicMessages(event.queryStringParameters?.lang, event.headers?.['accept-language']);
  const config = readAppConfigOrNull();

  if (!config) {
    return htmlResponse(503, renderInvalidLinkHtml(messages, locale));
  }

  const token = event.queryStringParameters?.token ?? '';
  const payload = verifyToken(token, config.signingSecret, Date.now());

  if (payload?.kind !== 'confirm') {
    return htmlResponse(400, renderInvalidLinkHtml(messages, locale));
  }

  return htmlResponse(200, renderConfirmPromptHtml(messages, locale, token));
};

export default defineLogicFunction({
  universalIdentifier: 'f4608804-f982-493a-9c77-6c96abf891e5',
  name: 'confirm-consent',
  description: 'Shows the confirmation button behind the link in the confirmation mail',
  timeoutSeconds: 20,
  handler,
  httpRouteTriggerSettings: {
    path: '/consents/confirm',
    httpMethod: 'GET',
    isAuthRequired: false,
    forwardedRequestHeaders: ['accept-language'],
  },
});
