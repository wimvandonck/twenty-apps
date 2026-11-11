import { type FormDefinition } from 'src/types/form-definition';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { enforceRequiredFields } from 'src/utils/enforce-required-fields.util';
import { pruneLinks } from 'src/utils/prune-links.util';
import { pruneLists } from 'src/utils/prune-lists.util';

// Brings a definition in line with the workspace's current objects: required
// and matched fields are enforced, stale fields, impossible links and lists without their person dropped.
export const normalizeDefinition = (
  definition: FormDefinition,
  objects: ObjectMetadata[],
): FormDefinition => {
  const records = definition.records.map((record) =>
    enforceRequiredFields(
      record,
      objects.find(({ nameSingular }) => nameSingular === record.objectNameSingular),
    ),
  );

  return {
    ...definition,
    records,
    links: pruneLinks(definition.links, records, objects),
    lists: pruneLists(definition.lists, records),
  };
};
