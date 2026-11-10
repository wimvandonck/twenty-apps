import { type FormDefinition } from 'src/types/form-definition';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { enforceRequiredFields } from 'src/utils/enforce-required-fields.util';
import { getAvailableLinks } from 'src/utils/get-available-links.util';
import { pruneLinks } from 'src/utils/prune-links.util';

// Brings a definition in line with the workspace's current objects: required
// and matched fields are enforced, stale fields and impossible links dropped.
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
    links: pruneLinks(definition.links, getAvailableLinks(records, objects)),
  };
};
