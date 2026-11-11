import { type FormFieldOption } from 'src/types/form-field-option';
import { type FormFieldType } from 'src/types/form-field-type';

export type FormField = {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: FormFieldOption[];
  // Prefills a visible field. For a hidden field it is the value written,
  // whatever the visitor posts. Same shape as a posted value: text, true,
  // option values, or the parts of a name, amount or address. A date can
  // also be "today" and a date and time "now".
  defaultValue?: string | boolean | string[] | Record<string, string>;
  // Hidden fields are not shown on the public form.
  hidden?: boolean;
};
