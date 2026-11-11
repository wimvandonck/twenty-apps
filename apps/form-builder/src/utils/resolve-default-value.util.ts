import { DEFAULT_NOW, DEFAULT_TODAY } from 'src/constants/relative-defaults';
import { type FormField } from 'src/types/form-field';

// The default as a posted value, with "today" and "now" worked out. The
// server has no idea of the visitor's time zone, so today is the UTC date.
export const resolveDefaultValue = (field: FormField, now: Date): FormField['defaultValue'] => {
  if (field.type === 'DATE' && field.defaultValue === DEFAULT_TODAY) {
    return now.toISOString().slice(0, 10);
  }

  if (field.type === 'DATE_TIME' && field.defaultValue === DEFAULT_NOW) {
    return now.toISOString();
  }

  return field.defaultValue;
};
