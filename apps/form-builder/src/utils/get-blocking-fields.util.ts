import { type FieldMetadata } from 'src/types/field-metadata';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { isRequiredField } from 'src/utils/is-required-field.util';
import { isSelectableField } from 'src/utils/is-selectable-field.util';

// Fields Twenty requires but a form cannot fill (an unsupported type, or a
// relation). A record of such an object cannot be created from a form unless
// a link fills the relation.
export const getBlockingFields = (object: ObjectMetadata): FieldMetadata[] =>
  object.fields.filter(
    (field) =>
      field.isActive &&
      !field.isSystem &&
      isRequiredField(field) &&
      !isSelectableField(field),
  );
