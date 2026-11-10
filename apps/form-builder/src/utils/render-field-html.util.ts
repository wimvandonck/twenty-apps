import { CURRENCY_CODES } from 'src/constants/currency-codes';
import { type FormField } from 'src/types/form-field';
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
export const renderFieldHtml = (recordKey: string, field: FormField): string => {
  const id = escapeHtml(`${recordKey}-${field.name}`);
  const target = `data-record="${escapeHtml(recordKey)}" data-field="${escapeHtml(field.name)}"`;
  const required = field.required ? ' required' : '';
  const marker = field.required ? ' <span class="required" aria-hidden="true">*</span>' : '';
  const label = `${escapeHtml(field.label)}${marker}`;
  const options = (field.options ?? [])
    .map(({ value, label: optionLabel }) => ({
      value: escapeHtml(value),
      label: escapeHtml(optionLabel),
    }));

  const part = (name: string, partLabel: string, type = 'text', partRequired = required) =>
    `<div><label for="${id}-${name}">${escapeHtml(partLabel)}</label><input id="${id}-${name}" type="${type}" ${target} data-part="${name}"${type === 'number' ? ' step="any"' : ''}${partRequired}></div>`;

  switch (field.type) {
    case 'BOOLEAN':
      return `<div class="field"><label class="check" for="${id}"><input id="${id}" type="checkbox" ${target} data-kind="boolean"${required}><span>${label}</span></label></div>`;
    case 'RICH_TEXT':
      return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" ${target}${required}></textarea></div>`;
    case 'DATE_TIME':
      return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="datetime-local" ${target} data-kind="datetime"${required}></div>`;
    case 'SELECT':
      return `<div class="field"><label for="${id}">${label}</label><select id="${id}" ${target}${required}><option value=""></option>${options
        .map(({ value, label: optionLabel }) => `<option value="${value}">${optionLabel}</option>`)
        .join('')}</select></div>`;
    case 'MULTI_SELECT':
      return `<fieldset><legend>${label}</legend>${options
        .map(
          ({ value, label: optionLabel }, index) =>
            `<label class="check" for="${id}-${index}"><input id="${id}-${index}" type="checkbox" value="${value}" ${target} data-kind="multi"><span>${optionLabel}</span></label>`,
        )
        .join('')}</fieldset>`;
    case 'FULL_NAME':
      return `<fieldset><legend>${label}</legend><div class="row">${part('firstName', 'First name')}${part('lastName', 'Last name')}</div></fieldset>`;
    case 'CURRENCY':
      return `<fieldset><legend>${label}</legend><div class="row">${part('amount', 'Amount', 'number')}<div><label for="${id}-currencyCode">Currency</label><select id="${id}-currencyCode" ${target} data-part="currencyCode">${CURRENCY_CODES.map(
        (code) => `<option value="${code}">${code}</option>`,
      ).join('')}</select></div></div></fieldset>`;
    case 'ADDRESS':
      return `<fieldset><legend>${label}</legend><div class="row">${part('street', 'Street')}${part('postcode', 'Postcode', 'text', '')}${part('city', 'City', 'text', '')}${part('country', 'Country', 'text', '')}</div></fieldset>`;
    default:
      return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${INPUT_TYPES[field.type] ?? 'text'}" ${target}${field.type === 'NUMBER' ? ' step="any"' : ''}${required}></div>`;
  }
};
