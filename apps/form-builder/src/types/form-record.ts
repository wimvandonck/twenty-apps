import { type FormField } from 'src/types/form-field';

export type FormRecord = {
  // Unique within the form, e.g. "person" or "company2".
  key: string;
  objectNameSingular: string;
  objectNamePlural: string;
  label: string;
  // UPSERT updates the record matching matchFieldName, or creates one.
  mode: 'CREATE' | 'UPSERT';
  matchFieldName?: string;
  fields: FormField[];
};
