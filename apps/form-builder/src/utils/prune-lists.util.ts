import { LIST_PERSON_OBJECT_NAME_SINGULAR } from 'src/constants/list-objects';
import { type FormList } from 'src/types/form-list';
import { type FormRecord } from 'src/types/form-record';

// Keeps only the lists whose person record is still in the form.
export const pruneLists = (lists: FormList[], records: FormRecord[]): FormList[] =>
  lists.filter(({ recordKey }) =>
    records.some(
      (record) => record.key === recordKey && record.objectNameSingular === LIST_PERSON_OBJECT_NAME_SINGULAR,
    ),
  );
