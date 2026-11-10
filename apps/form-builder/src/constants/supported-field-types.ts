import { type FormFieldType } from 'src/types/form-field-type';

export const SUPPORTED_FIELD_TYPES: readonly FormFieldType[] = [
  'TEXT',
  'NUMBER',
  'BOOLEAN',
  'DATE',
  'DATE_TIME',
  'SELECT',
  'MULTI_SELECT',
  'EMAILS',
  'PHONES',
  'LINKS',
  'FULL_NAME',
  'CURRENCY',
  'ADDRESS',
  'RICH_TEXT',
];
