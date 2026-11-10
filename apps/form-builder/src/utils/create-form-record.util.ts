import { type FormRecord } from 'src/types/form-record';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { isRequiredField } from 'src/utils/is-required-field.util';
import { isSelectableField } from 'src/utils/is-selectable-field.util';
import { toFormField } from 'src/utils/to-form-field.util';

// A new record for the form, starting with the fields Twenty requires. The
// key is the object name, numbered when the object is already in the form.
export const createFormRecord = (
  object: ObjectMetadata,
  existingKeys: string[],
): FormRecord => {
  let index = 1;
  let key = object.nameSingular;

  while (existingKeys.includes(key)) {
    index += 1;
    key = `${object.nameSingular}${index}`;
  }

  return {
    key,
    objectNameSingular: object.nameSingular,
    objectNamePlural: object.namePlural,
    label: index === 1 ? object.labelSingular : `${object.labelSingular} ${index}`,
    mode: 'CREATE',
    fields: object.fields
      .filter((field) => isSelectableField(field) && isRequiredField(field))
      .map(toFormField),
  };
};
