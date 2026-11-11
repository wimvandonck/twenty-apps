import { type FormField } from 'src/types/form-field';
import { resolveDefaultValue } from 'src/utils/resolve-default-value.util';
import { toFieldValue } from 'src/utils/to-field-value.util';

// Whether the default alone gives the field a value that can be written,
// which a required field needs before it can be hidden.
export const hasUsableDefault = (field: FormField): boolean =>
  toFieldValue(field, resolveDefaultValue(field, new Date())).status === 'VALID';
