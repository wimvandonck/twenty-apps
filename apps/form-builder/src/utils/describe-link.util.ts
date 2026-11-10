import { type FormLink } from 'src/types/form-link';
import { type FormRecord } from 'src/types/form-record';
import { type ObjectMetadata } from 'src/types/object-metadata';

// A short name for the relation a link goes through, e.g. "Person → Company"
// for a relation field or "Note targets" for a junction object.
export const describeLink = (
  link: FormLink,
  records: FormRecord[],
  objects: ObjectMetadata[],
): string => {
  if (link.kind === 'JUNCTION') {
    return (
      objects.find(({ namePlural }) => namePlural === link.junctionObjectNamePlural)?.labelPlural ??
      link.junctionObjectNamePlural
    );
  }

  const source = records.find(({ key }) => key === link.sourceRecordKey);
  const object = objects.find(({ nameSingular }) => nameSingular === source?.objectNameSingular);
  const field = object?.fields.find(({ name }) => name === link.relationFieldName);

  return `${source?.label ?? link.sourceRecordKey} → ${field?.label ?? link.relationFieldName}`;
};
