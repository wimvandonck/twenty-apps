import { type FormRecord } from 'src/types/form-record';

// The REST filter that finds the existing record an UPSERT should update, or
// null when the submission has no usable value to match on.
export const buildMatchFilter = (
  record: FormRecord,
  data: Record<string, unknown>,
): string | null => {
  const field = record.fields.find(({ name }) => name === record.matchFieldName);

  if (record.mode !== 'UPSERT' || field === undefined) {
    return null;
  }

  const value = data[field.name];
  const text =
    field.type === 'EMAILS'
      ? (value as { primaryEmail?: string } | undefined)?.primaryEmail
      : value;

  // Quotes and backslashes would break out of the quoted filter value.
  if (typeof text !== 'string' || text === '' || /["\\]/.test(text)) {
    return null;
  }

  const path = field.type === 'EMAILS' ? `${field.name}.primaryEmail` : field.name;

  return `${path}[eq]:"${text}"`;
};
