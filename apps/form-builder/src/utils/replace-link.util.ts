import { type FormLink } from 'src/types/form-link';
import { isSameLink } from 'src/utils/is-same-link.util';

// Puts `next` in place of the link at `index`, or appends it when index is
// null. A relation field holds one record, so any other link through the
// same field of the same record is dropped, as are exact duplicates.
export const replaceLink = (links: FormLink[], index: number | null, next: FormLink): FormLink[] => {
  const conflicts = (link: FormLink) =>
    isSameLink(link, next) ||
    (link.kind === 'DIRECT' &&
      next.kind === 'DIRECT' &&
      link.sourceRecordKey === next.sourceRecordKey &&
      link.relationFieldName === next.relationFieldName);
  const replaced = links.flatMap((link, position) =>
    position === index ? [next] : conflicts(link) ? [] : [link],
  );

  return index === null ? [...replaced, next] : replaced;
};
