import { type FormRecord } from 'src/types/form-record';
import { toFieldValue } from 'src/utils/to-field-value.util';

// Builds the data to write for one record. Only fields of the definition are
// read, so a submission can never set anything the form does not ask for.
export const buildRecordData = (
  record: FormRecord,
  values: Record<string, unknown>,
): { data: Record<string, unknown>; errors: string[] } => {
  const data: Record<string, unknown> = {};
  const errors: string[] = [];

  for (const field of record.fields) {
    const result = toFieldValue(field, values[field.name]);

    if (result.status === 'VALID') {
      data[field.name] = result.value;
    } else if (result.status === 'INVALID') {
      errors.push(`${field.label} ${result.reason}`);
    } else if (field.required) {
      errors.push(`${field.label} is required`);
    }
  }

  return { data, errors };
};
