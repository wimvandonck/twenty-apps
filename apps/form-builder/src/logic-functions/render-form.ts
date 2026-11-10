import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineLogicFunction } from 'twenty-sdk/define';
import { Response, type RoutePayload } from 'twenty-sdk/logic-function';

import { RENDER_FORM_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { fetchPublishedForm } from 'src/twenty-client/fetch-published-form';
import { renderFormHtml } from 'src/utils/render-form-html.util';
import { renderPageHtml } from 'src/utils/render-page-html.util';

const HTML_HEADERS = { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' };

const handler = async (event: RoutePayload) => {
  const definition = await fetchPublishedForm(
    new RestApiClient(),
    event.pathParameters?.formId,
  );

  if (definition === null) {
    return new Response(
      renderPageHtml('Form unavailable', '<h1>Form unavailable</h1><p>This form does not exist or is not published.</p>'),
      { status: 404, headers: HTML_HEADERS },
    );
  }

  return new Response(renderFormHtml(definition), { status: 200, headers: HTML_HEADERS });
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
  },
});
