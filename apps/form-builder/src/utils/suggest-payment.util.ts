import { LIST_PERSON_OBJECT_NAME_SINGULAR } from 'src/constants/list-objects';
import { type FormPayment } from 'src/types/form-payment';
import { type FormPicker } from 'src/types/form-picker';
import { type FormRecord } from 'src/types/form-record';
import { type ObjectMetadata } from 'src/types/object-metadata';

const PAYMENT_OBJECT_NAME_SINGULAR = 'payment';

const paymentColumn = (object: ObjectMetadata | undefined) =>
  object?.fields.find(
    (field) =>
      field.isActive &&
      field.type === 'RELATION' &&
      field.relationType === 'MANY_TO_ONE' &&
      field.relationTargetObjectNameSingular === PAYMENT_OBJECT_NAME_SINGULAR,
  )?.joinColumnName ?? null;

// Total and payment settings worked out from the form: an order-like total
// field receives the total, the first person pays, and every record or
// picker line that can point at a payment does.
export const suggestPayment = (allRecords: FormRecord[], pickers: FormPicker[], objects: ObjectMetadata[]): FormPayment => {
  // A record matched to an existing one never takes the total or the payment.
  const records = allRecords.filter(({ mode }) => mode !== 'UPSERT');
  const objectOf = (nameSingular: string) => objects.find((object) => object.nameSingular === nameSingular);
  const objectByPlural = (namePlural: string) => objects.find((object) => object.namePlural === namePlural);

  return {
    currencyCode: 'EUR',
    amountFields: [],
    totalFields: records.flatMap((record) =>
      objectOf(record.objectNameSingular)?.fields.some((field) => field.isActive && field.type === 'CURRENCY' && field.name === 'total')
        ? [{ recordKey: record.key, fieldName: 'total' }]
        : [],
    ),
    createPayment: true,
    checkout: 'NONE',
    payerRecordKey: allRecords.find(({ objectNameSingular }) => objectNameSingular === LIST_PERSON_OBJECT_NAME_SINGULAR)?.key ?? null,
    paymentLinks: [
      ...records.flatMap((record) => {
        const column = paymentColumn(objectOf(record.objectNameSingular));

        return column ? [{ recordKey: record.key, joinColumnName: column }] : [];
      }),
      ...pickers.flatMap((picker) => {
        const column = paymentColumn(objectByPlural(picker.line.objectNamePlural));

        return column ? [{ pickerKey: picker.key, joinColumnName: column }] : [];
      }),
    ],
  };
};
