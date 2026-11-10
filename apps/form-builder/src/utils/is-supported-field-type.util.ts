import { SUPPORTED_FIELD_TYPES } from 'src/constants/supported-field-types';
import { type FormFieldType } from 'src/types/form-field-type';

export const isSupportedFieldType = (type: string): type is FormFieldType =>
  (SUPPORTED_FIELD_TYPES as readonly string[]).includes(type);
