import { Response } from 'twenty-sdk/logic-function';

export const htmlResponse = (status: number, html: string) =>
  new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex',
      // The personal token sits in the address: never hand it on, never frame the page.
      'referrer-policy': 'no-referrer',
      'content-security-policy': "frame-ancestors 'none'",
      'x-content-type-options': 'nosniff',
    },
  });
