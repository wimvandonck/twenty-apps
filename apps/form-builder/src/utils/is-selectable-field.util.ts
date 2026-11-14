import { type FieldMetadata } from 'src/types/field-metadata';
import { isSupportedFieldType } from 'src/utils/is-supported-field-type.util';

// A field a form may ask for: never a system or read-only field, and only
// types the public form knows how to render and write.
export const isSelectableField = (field: FieldMetadata): boolean =>
  field.isActive &&
  !field.isSystem &&
  !field.isUIReadOnly &&
  isSupportedFieldType(field.type) &&
  // A relation only as a pointer to one existing record.
  (field.type !== 'RELATION' ||
    (field.relationType === 'MANY_TO_ONE' &&
      field.joinColumnName !== null &&
      field.relationTargetObjectNameSingular !== null &&
      field.relationTargetObjectNameSingular !== 'form'));
