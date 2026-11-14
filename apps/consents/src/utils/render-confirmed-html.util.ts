import { type PublicMessages } from 'src/types/public-messages';
import { escapeHtml } from 'src/utils/escape-html.util';
import { renderPageHtml } from 'src/utils/render-page-html.util';

export const renderConfirmedHtml = (
  messages: PublicMessages,
  locale: string,
  emailTypeNames: string[],
  preferencesUrl: string,
): string =>
  renderPageHtml(
    messages.confirmedTitle,
    `<h1>${escapeHtml(messages.confirmedTitle)}</h1>` +
      (emailTypeNames.length > 0
        ? `<p>${escapeHtml(messages.confirmedText)}</p><ul>${emailTypeNames.map((name) => `<li>${escapeHtml(name)}</li>`).join('')}</ul>`
        : '') +
      `<p><a href="${escapeHtml(preferencesUrl)}">${escapeHtml(messages.manageLink)}</a></p>`,
    locale,
  );
