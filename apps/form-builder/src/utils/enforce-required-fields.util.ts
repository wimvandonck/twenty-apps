import { type FormField } from 'src/types/form-field';
import { type FormRecord } from 'src/types/form-record';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { hasUsableDefault } from 'src/utils/has-usable-default.util';
import { isPageBreak } from 'src/utils/is-page-break.util';
import { isRequiredField } from 'src/utils/is-required-field.util';
import { isSelectableField } from 'src/utils/is-selectable-field.util';
import { toFormField } from 'src/utils/to-form-field.util';

// Brings a record's fields in line with its object: fields keep the order and
// settings (label, default, hidden) chosen in the builder, page breaks stay
// where they are, fields that no
// longer exist or became system fields are dropped, and every field Twenty
// requires, and the field an update matches on, is present and required.
export const enforceRequiredFields = (
  record: FormRecord,
  object: ObjectMetadata | undefined,
): FormRecord => {
  if (object === undefined) {
    return record;
  }

  const selectable = object.fields.filter(isSelectableField);
  const isForced = (name: string) =>
    selectable.some((metadata) => metadata.name === name && isRequiredField(metadata)) ||
    (record.mode === 'UPSERT' && record.matchFieldName === name);

  const kept = record.fields.flatMap((selected): FormField[] => {
    if (isPageBreak(selected)) {
      return [selected];
    }

    const metadata = selectable.find(({ name }) => name === selected.name);

    if (metadata === undefined) {
      return [];
    }

    const required = isForced(metadata.name) || selected.required;
    const field: FormField = {
      ...toFormField(metadata),
      label: selected.label,
      required,
      ...(selected.defaultValue !== undefined ? { defaultValue: selected.defaultValue } : {}),
    };

    // A required field can only be hidden when a default fills it.
    return [selected.hidden === true && (!required || hasUsableDefault(field)) ? { ...field, hidden: true } : field];
  });
  const missing = selectable
    .filter(({ name }) => isForced(name) && !kept.some((field) => field.name === name))
    .map((metadata) => ({ ...toFormField(metadata), required: true }));

  return { ...record, fields: [...kept, ...missing] };
};
