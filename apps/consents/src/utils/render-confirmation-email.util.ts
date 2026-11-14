import { type EmailMessage } from 'src/types/email-message';
import { type PublicLocale } from 'src/types/public-messages';
import { escapeHtml } from 'src/utils/escape-html.util';
import { fillTemplate } from 'src/utils/fill-template.util';
import { getPublicMessages } from 'src/utils/get-public-messages.util';

export type ConfirmationEmailInput = {
  firstName: string;
  organizationName: string;
  emailTypeNames: string[];
  confirmationUrl: string;
  locale: PublicLocale;
};

export const renderConfirmationEmail = (input: ConfirmationEmailInput): Omit<EmailMessage, 'to'> => {
  const { messages } = getPublicMessages(input.locale, undefined);
  const values = { organization: input.organizationName, firstName: input.firstName };
  const greeting = fillTemplate(input.firstName ? messages.emailGreeting : messages.emailGreetingNoName, values);
  const intro = fillTemplate(messages.emailIntro, values);
  const escapedUrl = escapeHtml(input.confirmationUrl);
  const html = `<!doctype html><html lang="${input.locale}"><body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#333">
<p>${escapeHtml(greeting)}</p>
<p>${escapeHtml(intro)}</p>
<ul>${input.emailTypeNames.map((name) => `<li>${escapeHtml(name)}</li>`).join('')}</ul>
<p><a href="${escapedUrl}" style="display:inline-block;padding:10px 18px;background:#3e63dd;color:#fff;text-decoration:none;border-radius:4px">${escapeHtml(messages.emailButton)}</a></p>
<p style="font-size:13px;color:#666">${escapeHtml(messages.emailValidity)}<br><a href="${escapedUrl}" style="color:#666;word-break:break-all">${escapedUrl}</a></p>
<p style="font-size:13px;color:#666">${escapeHtml(messages.emailIgnore)}</p>
</body></html>`;
  const text = [
    greeting,
    '',
    intro,
    ...input.emailTypeNames.map((name) => `- ${name}`),
    '',
    `${messages.emailButton}: ${input.confirmationUrl}`,
    messages.emailValidity,
    '',
    messages.emailIgnore,
  ].join('\n');

  return { subject: fillTemplate(messages.emailSubject, values), html, text };
};
