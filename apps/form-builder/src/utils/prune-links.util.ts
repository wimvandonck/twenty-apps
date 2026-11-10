import { type FormLink } from 'src/types/form-link';
import { type FormRecord } from 'src/types/form-record';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { getLinkPaths } from 'src/utils/get-link-paths.util';
import { isSameLink } from 'src/utils/is-same-link.util';

// Keeps only the links that are still possible, e.g. after a record was
// removed from the form or a relation was deleted in Twenty.
export const pruneLinks = (
  links: FormLink[],
  records: FormRecord[],
  objects: ObjectMetadata[],
): FormLink[] =>
  links.filter((link) => {
    const source = records.find(({ key }) => key === link.sourceRecordKey);
    const target = records.find(({ key }) => key === link.targetRecordKey);

    return (
      source !== undefined &&
      target !== undefined &&
      getLinkPaths(source, target, objects).some((path) => isSameLink(path, link))
    );
  });
