import { FORM_PAGE_STYLE } from 'src/constants/form-page-style';
import { escapeHtml } from 'src/utils/escape-html.util';

// The HTML document shell shared by the form and its error page.
export const renderPageHtml = (title: string, body: string): string =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title><style>${FORM_PAGE_STYLE}</style></head><body><main>${body}</main></body></html>`;
