import { type FormConsent } from 'src/types/form-consent';
import { type FormLink } from 'src/types/form-link';
import { type FormList } from 'src/types/form-list';
import { type FormPayment } from 'src/types/form-payment';
import { type FormPicker } from 'src/types/form-picker';
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
  consents: FormConsent[];
  pickers: FormPicker[];
  // null when the form has no total.
  payment: FormPayment | null;
};
