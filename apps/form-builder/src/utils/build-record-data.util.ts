import { type FormRecord } from 'src/types/form-record';
import { type PublicFormMessages } from 'src/types/public-form-messages';
import { toFieldValue } from 'src/utils/to-field-value.util';

// Builds the data to write for one record. Only fields of the definition are
// read, so a submission can never set anything the form does not ask for, and
// a hidden field always gets its default, whatever was posted.
export const buildRecordData = (
  record: FormRecord,
  values: Record<string, unknown>,
  messages: PublicFormMessages,
): { data: Record<string, unknown>; errors: string[] } => {
  const data: Record<string, unknown> = {};
  const errors: string[] = [];

  for (const field of record.fields) {
    const result = toFieldValue(
      field,
      field.hidden === true ? field.defaultValue : values[field.name],
    );

    if (result.status === 'VALID') {
      data[field.name] = result.value;
    } else if (result.status === 'INVALID') {
      errors.push(messages[result.reason].replace('{label}', field.label));
    } else if (field.required) {
      errors.push(messages.required.replace('{label}', field.label));
    }
  }

  return { data, errors };
};
