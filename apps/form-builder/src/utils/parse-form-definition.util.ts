import { LIST_PERSON_OBJECT_NAME_SINGULAR } from 'src/constants/list-objects';
import { CURRENCY_CODES } from 'src/constants/currency-codes';
import { MATCH_FIELD_TYPES } from 'src/constants/match-field-types';
import { type FormDefinition } from 'src/types/form-definition';
import { type FormField } from 'src/types/form-field';
import { type FormConsent } from 'src/types/form-consent';
import { type FormLink } from 'src/types/form-link';
import { type FormList } from 'src/types/form-list';
import { type FormPayment } from 'src/types/form-payment';
import { type FormPicker } from 'src/types/form-picker';
import { type FormRecord } from 'src/types/form-record';
import { hasUsableDefault } from 'src/utils/has-usable-default.util';
import { isSupportedFieldType } from 'src/utils/is-supported-field-type.util';
import { parseDefaultValue } from 'src/utils/parse-default-value.util';

// Names end up in API paths and filters, so only plain identifiers pass.
const IDENTIFIER = /^[a-zA-Z][a-zA-Z0-9]*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isIdentifier = (value: unknown): value is string =>
  typeof value === 'string' && IDENTIFIER.test(value);

const asText = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim() !== '' ? value : fallback;

const parseField = (value: unknown): FormField | null => {
  if (!isObject(value) || !isIdentifier(value.name) || typeof value.type !== 'string') {
    return null;
  }

  if (value.type === 'PAGE_BREAK') {
    return {
      name: value.name,
      // The step's title, which may be left empty.
      label: typeof value.label === 'string' ? value.label : '',
      type: 'PAGE_BREAK',
      required: false,
    };
  }

  if (!isSupportedFieldType(value.type)) {
    return null;
  }

  const options = Array.isArray(value.options)
    ? value.options
        .filter(isObject)
        .filter(({ value: optionValue }) => typeof optionValue === 'string')
        .map((option) => ({
          value: option.value as string,
          label: asText(option.label, option.value as string),
        }))
    : undefined;

  const relation = isObject(value.relation) ? value.relation : null;

  if (
    value.type === 'RELATION' &&
    (relation === null || !isIdentifier(relation.targetObjectNamePlural) || !isIdentifier(relation.joinColumnName))
  ) {
    return null;
  }

  const defaultValue = parseDefaultValue(value.type, value.defaultValue);
  const field: FormField = {
    name: value.name,
    label: asText(value.label, value.name),
    type: value.type,
    required: value.required === true,
    ...(options ? { options } : {}),
    ...(defaultValue !== undefined ? { defaultValue } : {}),
    ...(value.type === 'RELATION' && relation !== null
      ? {
          relation: {
            targetObjectNamePlural: relation.targetObjectNamePlural as string,
            joinColumnName: relation.joinColumnName as string,
          },
        }
      : {}),
  };

  // A required field can only be hidden when a default fills it.
  return value.hidden === true && (!field.required || hasUsableDefault(field)) ? { ...field, hidden: true } : field;
};

const parseRecord = (value: unknown): FormRecord | null => {
  if (
    !isObject(value) ||
    !isIdentifier(value.key) ||
    !isIdentifier(value.objectNameSingular) ||
    !isIdentifier(value.objectNamePlural) ||
    !Array.isArray(value.fields)
  ) {
    return null;
  }

  const fields = value.fields.map(parseField);

  if (fields.some((field) => field === null)) {
    return null;
  }

  const matchField = (fields as FormField[]).find(
    ({ name, type }) =>
      name === value.matchFieldName && MATCH_FIELD_TYPES.includes(type),
  );
  const isUpsert = value.mode === 'UPSERT' && matchField !== undefined;

  return {
    key: value.key,
    objectNameSingular: value.objectNameSingular,
    objectNamePlural: value.objectNamePlural,
    label: asText(value.label, value.objectNameSingular),
    mode: isUpsert ? 'UPSERT' : 'CREATE',
    ...(isUpsert ? { matchFieldName: matchField.name } : {}),
    fields: fields as FormField[],
  };
};

const parseLink = (value: unknown, recordKeys: string[]): FormLink | null => {
  if (
    !isObject(value) ||
    typeof value.sourceRecordKey !== 'string' ||
    typeof value.targetRecordKey !== 'string' ||
    !recordKeys.includes(value.sourceRecordKey) ||
    !recordKeys.includes(value.targetRecordKey) ||
    value.sourceRecordKey === value.targetRecordKey
  ) {
    return null;
  }

  const ends = {
    sourceRecordKey: value.sourceRecordKey,
    targetRecordKey: value.targetRecordKey,
  };

  if (value.kind === 'JUNCTION') {
    return isIdentifier(value.junctionObjectNamePlural) &&
      isIdentifier(value.sourceJoinColumnName) &&
      isIdentifier(value.targetJoinColumnName)
      ? {
          kind: 'JUNCTION',
          ...ends,
          junctionObjectNamePlural: value.junctionObjectNamePlural,
          sourceJoinColumnName: value.sourceJoinColumnName,
          targetJoinColumnName: value.targetJoinColumnName,
        }
      : null;
  }

  // Links saved before junction links existed have no kind.
  return isIdentifier(value.relationFieldName) && isIdentifier(value.joinColumnName)
    ? {
        kind: 'DIRECT',
        ...ends,
        relationFieldName: value.relationFieldName,
        joinColumnName: value.joinColumnName,
      }
    : null;
};

// Forms saved before lists existed have none. A list can only take the
// form's person records.
const parseList = (value: unknown, records: FormRecord[]): FormList | null => {
  if (
    !isObject(value) ||
    !isIdentifier(value.key) ||
    typeof value.listId !== 'string' ||
    !UUID.test(value.listId) ||
    !records.some(
      ({ key, objectNameSingular }) =>
        key === value.recordKey && objectNameSingular === LIST_PERSON_OBJECT_NAME_SINGULAR,
    )
  ) {
    return null;
  }

  const listName = asText(value.listName, '');
  const emailTypeId = typeof value.emailTypeId === 'string' && UUID.test(value.emailTypeId) ? value.emailTypeId : null;

  return {
    key: value.key,
    listId: value.listId,
    listName,
    recordKey: value.recordKey as string,
    // A list that requires consent always asks: nobody joins it unasked.
    optIn: value.optIn === true || emailTypeId !== null,
    label: asText(value.label, listName),
    checked: value.checked === true,
    emailTypeId,
  };
};

// Forms saved before consents existed have none. A consent can only take the
// form's person records.
const parseConsent = (value: unknown, records: FormRecord[]): FormConsent | null => {
  if (
    !isObject(value) ||
    !isIdentifier(value.key) ||
    typeof value.emailTypeId !== 'string' ||
    !UUID.test(value.emailTypeId) ||
    !records.some(
      ({ key, objectNameSingular }) =>
        key === value.recordKey && objectNameSingular === LIST_PERSON_OBJECT_NAME_SINGULAR,
    )
  ) {
    return null;
  }

  const emailTypeName = asText(value.emailTypeName, '');

  return {
    key: value.key,
    emailTypeId: value.emailTypeId,
    emailTypeName,
    recordKey: value.recordKey as string,
    label: asText(value.label, emailTypeName),
    required: value.required === true,
  };
};

const asIdentifierOrNull = (value: unknown): string | null => (isIdentifier(value) ? value : null);

const parseRecordFieldRefs = (value: unknown, recordKeys: string[]): Array<{ recordKey: string; fieldName: string }> | null => {
  const refs = Array.isArray(value) ? value : [];

  return refs.every((ref) => isObject(ref) && recordKeys.includes(ref.recordKey as string) && isIdentifier(ref.fieldName))
    ? refs.map((ref) => ({ recordKey: ref.recordKey as string, fieldName: ref.fieldName as string }))
    : null;
};

// Forms saved before pickers existed have none. A picker's line may only
// point at records of the form.
const parsePicker = (value: unknown, recordKeys: string[]): FormPicker | null => {
  if (!isObject(value) || !isIdentifier(value.key) || !isObject(value.source) || !isObject(value.line)) {
    return null;
  }

  const { source, line } = value;
  const filters = Array.isArray(source.filters) ? source.filters : [];
  const links = Array.isArray(line.links) ? line.links : [];
  const copies = Array.isArray(line.copies) ? line.copies : [];

  if (
    !isIdentifier(source.objectNamePlural) ||
    !isIdentifier(line.objectNamePlural) ||
    !isIdentifier(line.sourceJoinColumnName) ||
    !filters.every(
      (filter) => isObject(filter) && isIdentifier(filter.fieldName) && ['string', 'boolean'].includes(typeof filter.value),
    ) ||
    !links.every((link) => isObject(link) && isIdentifier(link.joinColumnName) && recordKeys.includes(link.recordKey as string)) ||
    !copies.every((copy) => isObject(copy) && isIdentifier(copy.sourceJoinColumnName) && isIdentifier(copy.lineJoinColumnName))
  ) {
    return null;
  }

  const maxQuantity = typeof value.maxQuantity === 'number' && Number.isInteger(value.maxQuantity) ? value.maxQuantity : 10;

  return {
    key: value.key,
    label: asText(value.label, ''),
    required: value.required === true,
    single: value.single === true,
    maxQuantity: Math.min(Math.max(maxQuantity, 1), 100),
    source: {
      objectNamePlural: source.objectNamePlural,
      priceFieldName: asIdentifierOrNull(source.priceFieldName),
      filters: filters.map((filter) => ({
        fieldName: (filter as Record<string, unknown>).fieldName as string,
        value: (filter as Record<string, unknown>).value as string | boolean,
      })),
    },
    line: {
      objectNamePlural: line.objectNamePlural,
      sourceJoinColumnName: line.sourceJoinColumnName,
      quantityFieldName: asIdentifierOrNull(line.quantityFieldName),
      unitPriceFieldName: asIdentifierOrNull(line.unitPriceFieldName),
      lineTotalFieldName: asIdentifierOrNull(line.lineTotalFieldName),
      links: links.map((link) => ({
        joinColumnName: (link as Record<string, unknown>).joinColumnName as string,
        recordKey: (link as Record<string, unknown>).recordKey as string,
      })),
      copies: copies.map((copy) => ({
        sourceJoinColumnName: (copy as Record<string, unknown>).sourceJoinColumnName as string,
        lineJoinColumnName: (copy as Record<string, unknown>).lineJoinColumnName as string,
      })),
    },
  };
};

// Returns undefined when the payment settings are malformed, null when there are none.
// A total or payment link on a record matched to an existing one would
// overwrite that record, which may already be paid, and a failed submission
// could not undo it. Those entries are dropped.
const parsePayment = (
  value: unknown,
  recordKeys: string[],
  pickerKeys: string[],
  upsertKeys: string[],
): FormPayment | null | undefined => {
  if (value === null || value === undefined) {
    return null;
  }

  if (!isObject(value) || typeof value.currencyCode !== 'string' || !CURRENCY_CODES.includes(value.currencyCode)) {
    return undefined;
  }

  const amountFields = parseRecordFieldRefs(value.amountFields, recordKeys);
  const totalFields = parseRecordFieldRefs(value.totalFields, recordKeys);
  const paymentLinks = Array.isArray(value.paymentLinks) ? value.paymentLinks : [];
  const linksValid = paymentLinks.every(
    (link) =>
      isObject(link) &&
      isIdentifier(link.joinColumnName) &&
      ((link.recordKey !== undefined && recordKeys.includes(link.recordKey as string)) ||
        (link.pickerKey !== undefined && pickerKeys.includes(link.pickerKey as string))),
  );
  const payerRecordKey = typeof value.payerRecordKey === 'string' && recordKeys.includes(value.payerRecordKey) ? value.payerRecordKey : null;

  if (amountFields === null || totalFields === null || !linksValid) {
    return undefined;
  }

  return {
    currencyCode: value.currencyCode,
    amountFields,
    totalFields: totalFields.filter(({ recordKey }) => !upsertKeys.includes(recordKey)),
    createPayment: value.createPayment === true,
    checkout: value.checkout === 'STRIPE' ? 'STRIPE' : 'NONE',
    payerRecordKey,
    paymentLinks: paymentLinks
      .map((link) => link as Record<string, unknown>)
      .filter((entry) => !upsertKeys.includes(entry.recordKey as string))
      .map((entry) => ({
        ...(entry.recordKey !== undefined ? { recordKey: entry.recordKey as string } : {}),
        ...(entry.pickerKey !== undefined ? { pickerKey: entry.pickerKey as string } : {}),
        joinColumnName: entry.joinColumnName as string,
      })),
  };
};

// Turns the stored JSON into a definition that is safe to render and write
// from. Returns null when it is missing or malformed.
export const parseFormDefinition = (value: unknown): FormDefinition | null => {
  if (!isObject(value) || !Array.isArray(value.records)) {
    return null;
  }

  const records = value.records.map(parseRecord);

  if (records.length === 0 || records.some((record) => record === null)) {
    return null;
  }

  const recordKeys = (records as FormRecord[]).map(({ key }) => key);

  if (new Set(recordKeys).size !== recordKeys.length) {
    return null;
  }

  const links = (Array.isArray(value.links) ? value.links : []).map((link) =>
    parseLink(link, recordKeys),
  );

  if (links.some((link) => link === null)) {
    return null;
  }

  const lists = (Array.isArray(value.lists) ? value.lists : []).map((list) =>
    parseList(list, records as FormRecord[]),
  );
  const listKeys = lists.map((list) => list?.key);

  if (lists.some((list) => list === null) || new Set(listKeys).size !== listKeys.length) {
    return null;
  }

  const consents = (Array.isArray(value.consents) ? value.consents : []).map((consent) =>
    parseConsent(consent, records as FormRecord[]),
  );
  const consentKeys = consents.map((consent) => consent?.key);

  if (consents.some((consent) => consent === null) || new Set(consentKeys).size !== consentKeys.length) {
    return null;
  }

  const pickers = (Array.isArray(value.pickers) ? value.pickers : []).map((picker) => parsePicker(picker, recordKeys));
  const pickerKeys = pickers.map((picker) => picker?.key);

  if (pickers.some((picker) => picker === null) || new Set(pickerKeys).size !== pickerKeys.length) {
    return null;
  }

  const upsertKeys = (records as FormRecord[]).filter(({ mode }) => mode === 'UPSERT').map(({ key }) => key);
  const payment = parsePayment(value.payment, recordKeys, pickerKeys as string[], upsertKeys);

  if (payment === undefined) {
    return null;
  }

  return {
    version: 1,
    title: asText(value.title, ''),
    description: asText(value.description, ''),
    submitLabel: asText(value.submitLabel, 'Submit'),
    successMessage: asText(value.successMessage, 'Thank you!'),
    records: records as FormRecord[],
    links: links as FormLink[],
    lists: lists as FormList[],
    consents: consents as FormConsent[],
    pickers: pickers as FormPicker[],
    payment,
  };
};
