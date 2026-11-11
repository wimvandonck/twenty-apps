import { type FormField } from 'src/types/form-field';
import { type FormRecord } from 'src/types/form-record';

// One page of the public form: the visible fields between two page breaks,
// grouped by the record they belong to.
export type FormStep = {
  title: string;
  sections: Array<{ record: FormRecord; fields: FormField[] }>;
};
