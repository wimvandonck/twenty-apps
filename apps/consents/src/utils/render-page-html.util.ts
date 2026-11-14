import { PAGE_STYLE } from 'src/constants/page-style';
import { escapeHtml } from 'src/utils/escape-html.util';

// The HTML document shell of the public pages.
export const renderPageHtml = (title: string, body: string, locale: string): string =>
  `<!doctype html><html lang="${escapeHtml(locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title><style>${PAGE_STYLE}</style></head><body><main>${body}</main></body></html>`;
