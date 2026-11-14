import { FORM_PAGE_SCRIPT } from 'src/constants/form-page-script';
import { type FormDefinition } from 'src/types/form-definition';
import { type PickerChoice } from 'src/types/picker-choice';
import { type PublicFormMessages } from 'src/types/public-form-messages';
import { escapeHtml } from 'src/utils/escape-html.util';
import { getFormSteps } from 'src/utils/get-form-steps.util';
import { renderFieldHtml } from 'src/utils/render-field-html.util';
import { renderPageHtml } from 'src/utils/render-page-html.util';
import { renderPickerHtml } from 'src/utils/render-picker-html.util';

// The complete public page for a form definition. Every step is in the page;
// the script shows them one at a time.
export const renderFormHtml = (
  definition: FormDefinition,
  messages: PublicFormMessages,
  locale = 'en',
  pickerChoices: Map<string, PickerChoice[]> = new Map(),
): string => {
  const steps = getFormSteps(definition);
  const hasSeveralRecords =
    new Set(steps.flatMap(({ sections }) => sections.map(({ record }) => record.key))).size > 1;
  const optIns = definition.lists
    .filter(({ optIn }) => optIn)
    .map((list) => {
      const id = escapeHtml(`list-${list.key}`);

      return `<div class="field"><label class="check" for="${id}"><input id="${id}" type="checkbox" data-list="${escapeHtml(list.key)}"${list.checked ? ' checked' : ''}><span>${escapeHtml(list.label)}</span></label></div>`;
    })
    .join('');
  const consentBoxes = definition.consents
    .map((consent) => {
      const id = escapeHtml(`consent-${consent.key}`);
      const required = consent.required ? ' required' : '';
      const marker = consent.required ? ' <span class="required" aria-hidden="true">*</span>' : '';

      return `<div class="field"><label class="check" for="${id}"><input id="${id}" type="checkbox" data-consent="${escapeHtml(consent.key)}"${required}><span>${escapeHtml(consent.label)}${marker}</span></label></div>`;
    })
    .join('');
  const pickers = definition.pickers
    .map((picker) => renderPickerHtml(picker, pickerChoices.get(picker.key) ?? [], messages, locale))
    .join('');
  const totalHtml =
    definition.pickers.length > 0
      ? `<p class="total" data-total data-currency="${escapeHtml(definition.payment?.currencyCode ?? 'EUR')}" data-locale="${escapeHtml(locale)}">${escapeHtml(messages.total)}: <strong data-total-amount></strong></p>`
      : '';
  // Pickers, the total and the boxes for consents and lists go at the end of
  // the last step.
  const stepsHtml = (steps.length > 0 ? steps : [{ title: '', sections: [] }])
    .map(
      (step, index, all) =>
        `<div class="step" data-step>${step.title ? `<h2 class="step-title">${escapeHtml(step.title)}</h2>` : ''}${step.sections
          .map(
            ({ record, fields }) =>
              `<section>${hasSeveralRecords ? `<h2>${escapeHtml(record.label)}</h2>` : ''}${fields
                .map((field) => renderFieldHtml(record.key, field, messages))
                .join('')}</section>`,
          )
          .join('')}${index === all.length - 1 ? pickers + totalHtml + consentBoxes + optIns : ''}</div>`,
    )
    .join('');

  return renderPageHtml(
    definition.title,
    `${definition.title ? `<h1>${escapeHtml(definition.title)}</h1>` : ''}${
      definition.description ? `<p>${escapeHtml(definition.description)}</p>` : ''
    }<form data-success="${escapeHtml(definition.successMessage)}" data-generic-error="${escapeHtml(messages.genericError)}" data-network-error="${escapeHtml(messages.networkError)}" data-step-label="${escapeHtml(messages.step)}"><p class="progress" data-progress hidden></p>${stepsHtml}<div class="trap" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div><div class="actions"><button type="button" class="secondary" data-back hidden>${escapeHtml(messages.back)}</button><button type="button" data-next hidden>${escapeHtml(messages.next)}</button><button type="submit">${escapeHtml(
      definition.submitLabel,
    )}</button></div></form><div id="message" class="message" role="status" hidden></div><script>${FORM_PAGE_SCRIPT}</script>`,
    locale,
  );
};
