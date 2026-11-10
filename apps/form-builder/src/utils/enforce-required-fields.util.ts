import { type FormRecord } from 'src/types/form-record';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { isRequiredField } from 'src/utils/is-required-field.util';
import { isSelectableField } from 'src/utils/is-selectable-field.util';
import { toFormField } from 'src/utils/to-form-field.util';

// Rebuilds a record's fields in the object's field order, keeping each
// field's own settings (label, default, hidden), dropping fields
// that no longer exist or became system fields, and making sure every field
// Twenty requires, and the field an update matches on, is present and required.
export const enforceRequiredFields = (
  record: FormRecord,
  object: ObjectMetadata | undefined,
): FormRecord => {
  if (object === undefined) {
    return record;
  }

  const fields = object.fields.filter(isSelectableField).flatMap((metadata) => {
    const selected = record.fields.find(({ name }) => name === metadata.name);
    const isForced =
      isRequiredField(metadata) ||
      (record.mode === 'UPSERT' && record.matchFieldName === metadata.name);

    if (selected === undefined && !isForced) {
      return [];
    }

    const required = isForced || selected?.required === true;
    const hasDefault = selected?.defaultValue !== undefined;

    return [
      {
        ...toFormField(metadata),
        label: selected?.label ?? metadata.label,
        required,
        ...(hasDefault ? { defaultValue: selected.defaultValue } : {}),
        // A required field can only be hidden when a default fills it.
        ...(selected?.hidden === true && (hasDefault || !required) ? { hidden: true } : {}),
      },
    ];
  });

  return { ...record, fields };
};
