import { type FormPicker } from 'src/types/form-picker';
import { type PickerChoice } from 'src/types/picker-choice';
import { type PublicFormMessages } from 'src/types/public-form-messages';
import { escapeHtml } from 'src/utils/escape-html.util';
import { formatMoney } from 'src/utils/format-money.util';

// A picker on the public form: every choice with its price, and a quantity
// or, in single mode, a radio button.
export const renderPickerHtml = (
  picker: FormPicker,
  choices: PickerChoice[],
  messages: PublicFormMessages,
  locale: string,
): string => {
  const marker = picker.required ? ' <span class="required" aria-hidden="true">*</span>' : '';
  const rows = choices
    .map((choice, index) => {
      const id = escapeHtml(`picker-${picker.key}-${index}`);
      const price =
        choice.priceMicros === null || choice.priceMicros === 0
          ? messages.free
          : formatMoney(choice.priceMicros, choice.currencyCode ?? 'EUR', locale);
      const data = `data-picker="${escapeHtml(picker.key)}" data-choice="${escapeHtml(choice.id)}" data-price="${choice.priceMicros ?? 0}"`;
      const control = picker.single
        ? `<input id="${id}" type="radio" name="picker-${escapeHtml(picker.key)}" ${data}${picker.required ? ' required' : ''}>`
        : `<input id="${id}" type="number" min="0" max="${picker.maxQuantity}" step="1" value="0" inputmode="numeric" ${data} aria-label="${escapeHtml(choice.label)}">`;

      return `<div class="pick"><label for="${id}"><span>${escapeHtml(choice.label)}</span><span class="price">${escapeHtml(price)}</span></label>${control}</div>`;
    })
    .join('');

  return `<fieldset class="picker"><legend>${escapeHtml(picker.label)}${marker}</legend>${rows}</fieldset>`;
};
