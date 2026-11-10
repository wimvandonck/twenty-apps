import { CURRENCY_CODES } from 'src/constants/currency-codes';
import { type FormField } from 'src/types/form-field';
import { type PublicFormMessages } from 'src/types/public-form-messages';
import { escapeHtml } from 'src/utils/escape-html.util';

const INPUT_TYPES: Partial<Record<FormField['type'], string>> = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  EMAILS: 'email',
  PHONES: 'tel',
  LINKS: 'url',
};

// One labelled control of the public form. recordKey and field names are
// identifiers, but every value is escaped anyway.
export const renderFieldHtml = (
  recordKey: string,
  field: FormField,
  messages: PublicFormMessages,
): string => {
  const id = escapeHtml(`${recordKey}-${field.name}`);
  const target = `data-record="${escapeHtml(recordKey)}" data-field="${escapeHtml(field.name)}"`;
  const required = field.required ? ' required' : '';
  const marker = field.required ? ' <span class="required" aria-hidden="true">*</span>' : '';
  const label = `${escapeHtml(field.label)}${marker}`;
  const defaults = Array.isArray(field.defaultValue) ? field.defaultValue : [field.defaultValue];
  const prefill = typeof field.defaultValue === 'string' ? escapeHtml(field.defaultValue) : '';
  const value = prefill === '' ? '' : ` value="${prefill}"`;
  const options = (field.options ?? [])
    .map((option) => ({
      value: escapeHtml(option.value),
      label: escapeHtml(option.label),
      chosen: defaults.includes(option.value),
    }));

  const part = (name: string, partLabel: string, type = 'text', partRequired = required) =>
    `<div><label for="${id}-${name}">${escapeHtml(partLabel)}</label><input id="${id}-${name}" type="${type}" ${target} data-part="${name}"${type === 'number' ? ' step="any"' : ''}${partRequired}></div>`;

  switch (field.type) {
    case 'BOOLEAN':
      return `<div class="field"><label class="check" for="${id}"><input id="${id}" type="checkbox" ${target} data-kind="boolean"${field.defaultValue === true ? ' checked' : ''}${required}><span>${label}</span></label></div>`;
    case 'RICH_TEXT':
      return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" ${target}${required}>${prefill}</textarea></div>`;
    case 'DATE_TIME':
      return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="datetime-local" ${target} data-kind="datetime"${required}></div>`;
    case 'SELECT':
      return `<div class="field"><label for="${id}">${label}</label><select id="${id}" ${target}${required}><option value=""></option>${options
        .map((option) => `<option value="${option.value}"${option.chosen ? ' selected' : ''}>${option.label}</option>`)
        .join('')}</select></div>`;
    case 'MULTI_SELECT':
      return `<fieldset><legend>${label}</legend>${options
        .map(
          (option, index) =>
            `<label class="check" for="${id}-${index}"><input id="${id}-${index}" type="checkbox" value="${option.value}" ${target} data-kind="multi"${option.chosen ? ' checked' : ''}><span>${option.label}</span></label>`,
        )
        .join('')}</fieldset>`;
    case 'FULL_NAME':
      return `<fieldset><legend>${label}</legend><div class="row">${part('firstName', messages.firstName)}${part('lastName', messages.lastName)}</div></fieldset>`;
    case 'CURRENCY':
      return `<fieldset><legend>${label}</legend><div class="row">${part('amount', messages.amount, 'number')}<div><label for="${id}-currencyCode">${escapeHtml(messages.currency)}</label><select id="${id}-currencyCode" ${target} data-part="currencyCode">${CURRENCY_CODES.map(
        (code) => `<option value="${code}">${code}</option>`,
      ).join('')}</select></div></div></fieldset>`;
    case 'ADDRESS':
      return `<fieldset><legend>${label}</legend><div class="row">${part('street', messages.street)}${part('postcode', messages.postcode, 'text', '')}${part('city', messages.city, 'text', '')}${part('country', messages.country, 'text', '')}</div></fieldset>`;
    default:
      return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${INPUT_TYPES[field.type] ?? 'text'}" ${target}${field.type === 'NUMBER' ? ' step="any"' : ''}${value}${required}></div>`;
  }
};
