import { type FieldMetadata } from 'src/types/field-metadata';
import { type FormField } from 'src/types/form-field';
import { type FormFieldType } from 'src/types/form-field-type';
import { isRequiredField } from 'src/utils/is-required-field.util';

export const toFormField = (field: FieldMetadata): FormField => ({
  name: field.name,
  label: field.label,
  type: field.type as FormFieldType,
  required: isRequiredField(field),
  ...(field.options
    ? {
        options: field.options.map(({ value, label }) => ({ value, label })),
      }
    : {}),
});
