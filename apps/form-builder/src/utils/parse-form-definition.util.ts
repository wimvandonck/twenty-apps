import { DEFAULT_VALUE_FIELD_TYPES } from 'src/constants/default-value-field-types';
import { MATCH_FIELD_TYPES } from 'src/constants/match-field-types';
import { type FormDefinition } from 'src/types/form-definition';
import { type FormField } from 'src/types/form-field';
import { type FormLink } from 'src/types/form-link';
import { type FormRecord } from 'src/types/form-record';
import { isSupportedFieldType } from 'src/utils/is-supported-field-type.util';

// Names end up in API paths and filters, so only plain identifiers pass.
const IDENTIFIER = /^[a-zA-Z][a-zA-Z0-9]*$/;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isIdentifier = (value: unknown): value is string =>
  typeof value === 'string' && IDENTIFIER.test(value);

const asText = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim() !== '' ? value : fallback;

const parseField = (value: unknown): FormField | null => {
  if (
    !isObject(value) ||
    !isIdentifier(value.name) ||
    typeof value.type !== 'string' ||
    !isSupportedFieldType(value.type)
  ) {
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

  const rawDefault = value.defaultValue;
  const defaultValue =
    !DEFAULT_VALUE_FIELD_TYPES.includes(value.type) || rawDefault === '' || rawDefault === false
      ? undefined
      : typeof rawDefault === 'string' || rawDefault === true
        ? rawDefault
        : Array.isArray(rawDefault) && rawDefault.length > 0 && rawDefault.every((item) => typeof item === 'string')
          ? (rawDefault as string[])
          : undefined;

  return {
    name: value.name,
    label: asText(value.label, value.name),
    type: value.type,
    required: value.required === true,
    ...(options ? { options } : {}),
    ...(defaultValue !== undefined ? { defaultValue } : {}),
    // A hidden field without a default would never get a value.
    ...(value.hidden === true && defaultValue !== undefined ? { hidden: true } : {}),
  };
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

  return {
    version: 1,
    title: asText(value.title, ''),
    description: asText(value.description, ''),
    submitLabel: asText(value.submitLabel, 'Submit'),
    successMessage: asText(value.successMessage, 'Thank you!'),
    records: records as FormRecord[],
    links: links as FormLink[],
  };
};
