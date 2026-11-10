import { type FormLink } from 'src/types/form-link';

// Keeps only the links that are still possible, e.g. after a record was
// removed from the form.
export const pruneLinks = (links: FormLink[], availableLinks: FormLink[]): FormLink[] =>
  links.filter((link) =>
    availableLinks.some(
      (available) =>
        available.sourceRecordKey === link.sourceRecordKey &&
        available.relationFieldName === link.relationFieldName &&
        available.targetRecordKey === link.targetRecordKey,
    ),
  );
