import { FIELD_PARTS } from 'src/constants/field-parts';
import { type FormField } from 'src/types/form-field';
import { type FormFieldType } from 'src/types/form-field-type';

// The stored default of a field, or undefined when it is empty or has the
// wrong shape for the field's type.
export const parseDefaultValue = (type: FormFieldType, raw: unknown): FormField['defaultValue'] => {
  const parts = FIELD_PARTS[type];

  if (type === 'PAGE_BREAK') {
    return undefined;
  }

  if (type === 'BOOLEAN') {
    return raw === true ? true : undefined;
  }

  if (type === 'MULTI_SELECT') {
    return Array.isArray(raw) && raw.length > 0 && raw.every((item) => typeof item === 'string')
      ? (raw as string[])
      : undefined;
  }

  if (parts !== undefined) {
    const values = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
    const filled = parts.flatMap((part): Array<[string, string]> => {
      const value = values[part];

      return typeof value === 'string' && value !== '' ? [[part, value]] : [];
    });

    return filled.length > 0 ? Object.fromEntries(filled) : undefined;
  }

  return typeof raw === 'string' && raw !== '' ? raw : undefined;
};
