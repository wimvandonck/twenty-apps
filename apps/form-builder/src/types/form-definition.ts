import { type FormLink } from 'src/types/form-link';
import { type FormList } from 'src/types/form-list';
import { type FormRecord } from 'src/types/form-record';

export type FormDefinition = {
  version: 1;
  title: string;
  description: string;
  submitLabel: string;
  successMessage: string;
  records: FormRecord[];
  links: FormLink[];
  lists: FormList[];
};
