import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineLogicFunction } from 'twenty-sdk/define';
import { Response, type RoutePayload } from 'twenty-sdk/logic-function';

import { RENDER_FORM_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { fetchPublishedForm } from 'src/twenty-client/fetch-published-form';
import { escapeHtml } from 'src/utils/escape-html.util';
import { getPublicFormMessages } from 'src/utils/get-public-form-messages.util';
import { renderFormHtml } from 'src/utils/render-form-html.util';
import { renderPageHtml } from 'src/utils/render-page-html.util';

const HTML_HEADERS = { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' };

const handler = async (event: RoutePayload) => {
  // ?lang=nl-NL forces a language; otherwise the browser's is used.
  const { locale, messages } = getPublicFormMessages(
    event.queryStringParameters?.lang,
    event.headers?.['accept-language'],
  );
  const definition = await fetchPublishedForm(new RestApiClient(), event.pathParameters?.formId);

  if (definition === null) {
    return new Response(
      renderPageHtml(
        messages.unavailableTitle,
        `<h1>${escapeHtml(messages.unavailableTitle)}</h1><p>${escapeHtml(messages.unavailableText)}</p>`,
        locale,
      ),
      { status: 404, headers: HTML_HEADERS },
    );
  }

  return new Response(renderFormHtml(definition, messages, locale), { status: 200, headers: HTML_HEADERS });
};

export default defineLogicFunction({
  universalIdentifier: RENDER_FORM_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'render-form',
  description: 'Serves the public HTML page of a published form',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/forms/:formId',
    httpMethod: 'GET',
    isAuthRequired: false,
    forwardedRequestHeaders: ['accept-language'],
  },
});
