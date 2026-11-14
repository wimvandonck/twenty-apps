import { LIST_PERSON_OBJECT_NAME_SINGULAR } from 'src/constants/list-objects';
import { type FormConsent } from 'src/types/form-consent';
import { type FormRecord } from 'src/types/form-record';

// Keeps only the consents whose person record is still in the form.
export const pruneConsents = (consents: FormConsent[], records: FormRecord[]): FormConsent[] =>
  consents.filter(({ recordKey }) =>
    records.some(
      (record) => record.key === recordKey && record.objectNameSingular === LIST_PERSON_OBJECT_NAME_SINGULAR,
    ),
  );
