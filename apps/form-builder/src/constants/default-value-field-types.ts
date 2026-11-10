import { type FormFieldType } from 'src/types/form-field-type';

// Field types that can carry a default value, and so can be hidden.
export const DEFAULT_VALUE_FIELD_TYPES: readonly FormFieldType[] = [
  'TEXT',
  'RICH_TEXT',
  'NUMBER',
  'BOOLEAN',
  'DATE',
  'SELECT',
  'MULTI_SELECT',
  'EMAILS',
  'PHONES',
  'LINKS',
];
