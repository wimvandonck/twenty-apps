import { type FormFieldOption } from 'src/types/form-field-option';
import { type FormFieldType } from 'src/types/form-field-type';

export type FormField = {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: FormFieldOption[];
  // Prefills a visible field. For a hidden field it is the value written,
  // whatever the visitor posts. Same shape as a posted value.
  defaultValue?: string | boolean | string[];
  // Hidden fields are not shown on the public form.
  hidden?: boolean;
};
