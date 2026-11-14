import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';

import { htmlResponse } from 'src/utils/html-response.util';
import { renderReturnHtml } from 'src/utils/render-return-html.util';

// Where Stripe sends visitors back to, when the caller gave no address of its own.
const handler = async (event: RoutePayload) =>
  htmlResponse(
    200,
    renderReturnHtml(event.queryStringParameters?.result, event.queryStringParameters?.lang ?? event.headers?.['accept-language']),
  );

export default defineLogicFunction({
  universalIdentifier: '051c8022-4be6-4b34-a37f-d4b42a8c7747',
  name: 'checkout-return',
  description: 'Thanks the visitor after paying, or confirms a cancelled payment',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/stripe/return',
    httpMethod: 'GET',
    isAuthRequired: false,
    forwardedRequestHeaders: ['accept-language'],
  },
});
