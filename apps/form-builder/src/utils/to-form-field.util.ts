import { type FieldMetadata } from 'src/types/field-metadata';
import { type FormField } from 'src/types/form-field';
import { type FormFieldType } from 'src/types/form-field-type';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { isRequiredField } from 'src/utils/is-required-field.util';

// objects resolves where a relation's choices come from.
export const toFormField = (field: FieldMetadata, objects: ObjectMetadata[] = []): FormField => ({
  name: field.name,
  label: field.label,
  type: field.type as FormFieldType,
  required: isRequiredField(field),
  ...(field.options
    ? {
        options: field.options.map(({ value, label }) => ({ value, label })),
      }
    : {}),
  ...(field.type === 'RELATION' && field.joinColumnName
    ? {
        relation: {
          targetObjectNamePlural:
            objects.find(({ nameSingular }) => nameSingular === field.relationTargetObjectNameSingular)?.namePlural ?? '',
          joinColumnName: field.joinColumnName,
        },
      }
    : {}),
});
