import { type FormDefinition } from 'src/types/form-definition';

export const EMPTY_FORM_DEFINITION: FormDefinition = {
  version: 1,
  title: '',
  description: '',
  submitLabel: 'Submit',
  successMessage: 'Thank you!',
  records: [],
  links: [],
};
