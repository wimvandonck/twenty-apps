import { type FormPayment } from 'src/types/form-payment';
import { type PublicFormMessages } from 'src/types/public-form-messages';

type Money = { amountMicros: number; currencyCode: string };

const isMoney = (value: unknown): value is Money =>
  typeof value === 'object' && value !== null && typeof (value as Money).amountMicros === 'number';

// The total of a submission: the pickers plus the amounts the visitor
// entered in the fields that count, all in the form's currency.
export const computeTotal = (
  payment: FormPayment,
  dataByRecord: Record<string, Record<string, unknown>>,
  pickersMicros: number,
  messages: PublicFormMessages,
): { totalMicros: number; errors: string[] } => {
  const errors: string[] = [];
  let totalMicros = pickersMicros;

  for (const { recordKey, fieldName } of payment.amountFields) {
    const value = dataByRecord[recordKey]?.[fieldName];

    if (!isMoney(value)) {
      continue;
    }

    if (value.amountMicros < 0) {
      errors.push(messages.invalidNumber.replace('{label}', fieldName));
    } else if (value.currencyCode !== payment.currencyCode) {
      errors.push(messages.invalidCurrency.replace('{label}', fieldName));
    } else {
      totalMicros += value.amountMicros;
    }
  }

  return { totalMicros, errors };
};
