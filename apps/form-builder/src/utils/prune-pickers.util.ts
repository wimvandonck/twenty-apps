import { type FormDefinition } from 'src/types/form-definition';

// Drops the parts of pickers and payment settings that point at records or
// pickers no longer in the form.
export const prunePickers = (definition: FormDefinition): Pick<FormDefinition, 'pickers' | 'payment'> => {
  const recordKeys = new Set(definition.records.map(({ key }) => key));
  const pickers = definition.pickers.map((picker) => ({
    ...picker,
    line: { ...picker.line, links: picker.line.links.filter(({ recordKey }) => recordKeys.has(recordKey)) },
  }));
  const pickerKeys = new Set(pickers.map(({ key }) => key));
  const payment = definition.payment && {
    ...definition.payment,
    amountFields: definition.payment.amountFields.filter(({ recordKey }) => recordKeys.has(recordKey)),
    totalFields: definition.payment.totalFields.filter(({ recordKey }) => recordKeys.has(recordKey)),
    payerRecordKey:
      definition.payment.payerRecordKey && recordKeys.has(definition.payment.payerRecordKey) ? definition.payment.payerRecordKey : null,
    paymentLinks: definition.payment.paymentLinks.filter(
      ({ recordKey, pickerKey }) => (recordKey !== undefined && recordKeys.has(recordKey)) || (pickerKey !== undefined && pickerKeys.has(pickerKey)),
    ),
  };

  return { pickers, payment };
};
