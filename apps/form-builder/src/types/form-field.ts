import { type FormFieldOption } from 'src/types/form-field-option';
import { type FormFieldType } from 'src/types/form-field-type';

export type FormField = {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: FormFieldOption[];
};
