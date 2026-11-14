import { Response } from 'twenty-sdk/logic-function';

export const htmlResponse = (status: number, html: string) =>
  new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
  });
