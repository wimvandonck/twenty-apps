import RETURN_MESSAGES from 'src/constants/return-messages.json';
import { escapeHtml } from 'src/utils/escape-html.util';

type Locale = keyof typeof RETURN_MESSAGES;

const STYLE =
  'body{margin:0;padding:32px 16px;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:15px;line-height:1.5;color:#333}main{max-width:520px;margin:0 auto}h1{font-size:20px;font-weight:600;margin:0 0 8px}p{color:#666}@media (prefers-color-scheme:dark){body{background:#171717;color:#ebebeb}p{color:#b3b3b3}}';

// The page Stripe sends a visitor back to after paying or cancelling.
export const renderReturnHtml = (result: string | undefined, language: string | undefined): string => {
  const locale: Locale = (['nl', 'fr'] as const).find((candidate) => language?.toLowerCase().startsWith(candidate)) ?? 'en';
  const messages = RETURN_MESSAGES[locale];
  const isSuccess = result === 'success';
  const title = isSuccess ? messages.successTitle : messages.cancelTitle;
  const text = isSuccess ? messages.successText : messages.cancelText;

  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title><style>${STYLE}</style></head><body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(text)}</p></main></body></html>`;
};
