import { type FormPicker } from 'src/types/form-picker';
import { type PickerChoice } from 'src/types/picker-choice';
import { type PublicFormMessages } from 'src/types/public-form-messages';

export type PickerLines = { lines: Array<Record<string, unknown>>; totalMicros: number; errors: string[] };

const money = (micros: number, currencyCode: string) => ({ amountMicros: micros, currencyCode });

// The quantities posted for a picker: choice id -> quantity, or in single
// mode { choice: id }.
const toQuantities = (picker: FormPicker, posted: Record<string, unknown>): Array<[string, unknown]> =>
  picker.single
    ? typeof posted.choice === 'string' && posted.choice !== ''
      ? [[posted.choice, '1']]
      : []
    : Object.entries(posted);

// The line records a picker's choices become, with prices taken from the
// records in Twenty, never from the browser.
export const buildPickerLines = (
  picker: FormPicker,
  choices: PickerChoice[],
  posted: Record<string, unknown>,
  messages: PublicFormMessages,
  currencyCode: string,
): PickerLines => {
  const lines: Array<Record<string, unknown>> = [];
  const errors: string[] = [];
  let totalMicros = 0;

  for (const [choiceId, rawQuantity] of toQuantities(picker, posted)) {
    const text = typeof rawQuantity === 'string' || typeof rawQuantity === 'number' ? String(rawQuantity).trim() : '';
    const quantity = text === '' ? 0 : Number(text);

    if (!Number.isInteger(quantity) || quantity < 0 || quantity > picker.maxQuantity) {
      errors.push(messages.invalidNumber.replace('{label}', picker.label));
      continue;
    }

    if (quantity === 0) {
      continue;
    }

    const choice = choices.find(({ id }) => id === choiceId);

    if (choice === undefined) {
      errors.push(messages.invalidChoice.replace('{label}', picker.label));
      continue;
    }

    if (choice.priceMicros !== null && choice.currencyCode !== currencyCode) {
      return { lines: [], totalMicros: 0, errors: [messages.misconfigured] };
    }

    const unitMicros = choice.priceMicros ?? 0;
    const base: Record<string, unknown> = { [picker.line.sourceJoinColumnName]: choice.id };

    if (picker.line.unitPriceFieldName) {
      base[picker.line.unitPriceFieldName] = money(unitMicros, currencyCode);
    }

    for (const copy of picker.line.copies) {
      if (choice.record[copy.sourceJoinColumnName] != null) {
        base[copy.lineJoinColumnName] = choice.record[copy.sourceJoinColumnName];
      }
    }

    if (picker.line.quantityFieldName) {
      lines.push({
        [picker.line.sourceJoinColumnName]: choice.id,
        [picker.line.quantityFieldName]: quantity,
        ...base,
        ...(picker.line.lineTotalFieldName ? { [picker.line.lineTotalFieldName]: money(unitMicros * quantity, currencyCode) } : {}),
      });
    } else {
      for (let unit = 0; unit < quantity; unit += 1) {
        lines.push({
          ...base,
          ...(picker.line.lineTotalFieldName ? { [picker.line.lineTotalFieldName]: money(unitMicros, currencyCode) } : {}),
        });
      }
    }

    totalMicros += unitMicros * quantity;
  }

  if (errors.length === 0 && picker.required && lines.length === 0) {
    errors.push(messages.required.replace('{label}', picker.label));
  }

  return { lines, totalMicros, errors };
};
