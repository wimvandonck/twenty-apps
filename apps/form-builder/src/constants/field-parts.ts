import { type FormFieldType } from 'src/types/form-field-type';

// The inputs a composite field is split into on the form.
export const FIELD_PARTS: Partial<Record<FormFieldType, readonly string[]>> = {
  FULL_NAME: ['firstName', 'lastName'],
  CURRENCY: ['amount', 'currencyCode'],
  ADDRESS: ['street', 'postcode', 'city', 'country'],
};
