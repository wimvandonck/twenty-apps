import { type FormLink } from 'src/types/form-link';
import { type FormRecord } from 'src/types/form-record';

// Orders records so that a link's target is written before its source, which
// needs the target's id. Returns null when the links form a cycle.
export const sortRecordsByLinks = (
  records: FormRecord[],
  links: FormLink[],
): FormRecord[] | null => {
  const sorted: FormRecord[] = [];
  const remaining = [...records];

  while (remaining.length > 0) {
    const sortedKeys = new Set(sorted.map(({ key }) => key));
    const nextIndex = remaining.findIndex((record) =>
      links
        .filter(({ sourceRecordKey }) => sourceRecordKey === record.key)
        .every(({ targetRecordKey }) => sortedKeys.has(targetRecordKey)),
    );

    if (nextIndex === -1) {
      return null;
    }

    sorted.push(...remaining.splice(nextIndex, 1));
  }

  return sorted;
};
