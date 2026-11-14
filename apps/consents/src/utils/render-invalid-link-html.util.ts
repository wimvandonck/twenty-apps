import { type PublicMessages } from 'src/types/public-messages';
import { escapeHtml } from 'src/utils/escape-html.util';
import { renderPageHtml } from 'src/utils/render-page-html.util';

export const renderInvalidLinkHtml = (messages: PublicMessages, locale: string): string =>
  renderPageHtml(
    messages.invalidTitle,
    `<h1>${escapeHtml(messages.invalidTitle)}</h1><p>${escapeHtml(messages.invalidText)}</p>`,
    locale,
  );
