import { type PreferenceGroupList, type PreferenceGroups } from 'src/types/preference-groups';
import { type PublicMessages } from 'src/types/public-messages';
import { escapeHtml } from 'src/utils/escape-html.util';
import { fillTemplate } from 'src/utils/fill-template.util';
import { renderPageHtml } from 'src/utils/render-page-html.util';

export type PreferencesPageInput = {
  messages: PublicMessages;
  locale: string;
  organizationName: string;
  firstName: string;
  groups: PreferenceGroups;
  token: string;
  saved: boolean;
};

const checkbox = (name: string, value: string, checked: boolean, disabled: boolean, extra = '') =>
  `<input type="checkbox" id="${name}-${escapeHtml(value)}" name="${name}" value="${escapeHtml(value)}"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}${extra}>`;

const listOption = (list: PreferenceGroupList, messages: PublicMessages, emailTypeName?: string) =>
  `<div class="option${list.isDisabled ? ' disabled' : ''}" data-list>${checkbox('list', list.id, list.isMember, list.isDisabled)}<label for="list-${escapeHtml(list.id)}">${escapeHtml(list.name)}${
    list.isDisabled && emailTypeName
      ? `<span class="help" data-hint>${escapeHtml(fillTemplate(messages.needsConsent, { emailType: emailTypeName }))}</span>`
      : ''
  }</label></div>`;

// Switching a consent on or off enables or disables the lists under it.
const SCRIPT = `<script>document.querySelectorAll('[data-consent]').forEach(function(box){box.addEventListener('change',function(){var group=document.getElementById('lists-'+box.value);if(!group)return;group.querySelectorAll('[data-list]').forEach(function(option){option.classList.toggle('disabled',!box.checked);option.querySelector('input').disabled=!box.checked;var hint=option.querySelector('[data-hint]');if(hint)hint.hidden=box.checked;});});});</script>`;

export const renderPreferencesHtml = (input: PreferencesPageInput): string => {
  const { messages, groups } = input;
  const values = { organization: input.organizationName, firstName: input.firstName };
  const intro = fillTemplate(input.firstName ? messages.preferencesIntroName : messages.preferencesIntro, values);
  const consents = groups.consents
    .map(
      ({ emailType, isGranted }) =>
        `<div class="option">${checkbox('consent', emailType.id, isGranted, false, ' data-consent')}<label for="consent-${escapeHtml(emailType.id)}">${escapeHtml(emailType.name)}${
          emailType.description ? `<span class="help">${escapeHtml(emailType.description)}</span>` : ''
        }</label></div>`,
    )
    .join('');
  const topics = groups.consents
    .filter((group) => group.lists.length > 0)
    .map(
      ({ emailType, lists }) =>
        `<div id="lists-${escapeHtml(emailType.id)}"><h3>${escapeHtml(emailType.name)}</h3>${lists
          .map((list) => listOption(list, messages, emailType.name))
          .join('')}</div>`,
    )
    .join('');
  const others =
    groups.otherLists.length > 0
      ? `<h3>${escapeHtml(messages.otherListsHeading)}</h3>${groups.otherLists.map((list) => listOption(list, messages)).join('')}`
      : '';
  const isEmpty = groups.consents.length === 0 && groups.otherLists.length === 0;
  const body =
    `<h1>${escapeHtml(messages.preferencesTitle)}</h1>` +
    (input.saved ? `<p class="notice" role="status">${escapeHtml(messages.savedNotice)}</p>` : '') +
    `<p>${escapeHtml(intro)}</p>` +
    (isEmpty
      ? `<p>${escapeHtml(messages.nothingToChoose)}</p>`
      : `<form method="post"><input type="hidden" name="token" value="${escapeHtml(input.token)}">` +
        (consents ? `<h2>${escapeHtml(messages.consentsHeading)}</h2><p>${escapeHtml(messages.consentsHelp)}</p>${consents}` : '') +
        (topics || others
          ? `<h2>${escapeHtml(messages.preferencesHeading)}</h2><p>${escapeHtml(messages.preferencesHelp)}</p>${topics}${others}`
          : '') +
        `<button type="submit">${escapeHtml(messages.saveButton)}</button></form>${SCRIPT}`);

  return renderPageHtml(messages.preferencesTitle, body, input.locale);
};
