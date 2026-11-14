import { type PublicMessages } from 'src/types/public-messages';
import { escapeHtml } from 'src/utils/escape-html.util';
import { renderPageHtml } from 'src/utils/render-page-html.util';

// Opening the link only shows a button: mail scanners that open links must
// not confirm on the person's behalf.
export const renderConfirmPromptHtml = (messages: PublicMessages, locale: string, token: string): string =>
  renderPageHtml(
    messages.confirmPromptTitle,
    `<h1>${escapeHtml(messages.confirmPromptTitle)}</h1><p>${escapeHtml(messages.confirmPromptText)}</p>` +
      `<form method="post"><input type="hidden" name="token" value="${escapeHtml(token)}"><button type="submit">${escapeHtml(messages.emailButton)}</button></form>`,
    locale,
  );
