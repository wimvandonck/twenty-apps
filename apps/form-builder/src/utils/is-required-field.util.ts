import { type FieldMetadata } from 'src/types/field-metadata';

// Twenty rejects a record without a value for a non-nullable field that has
// no default, so the form must always ask for it.
export const isRequiredField = (field: FieldMetadata): boolean =>
  !field.isNullable &&
  (field.defaultValue === null || field.defaultValue === undefined);
