import { type FormDefinition } from 'src/types/form-definition';
import { type RelationRecordLoader } from 'src/types/relation-record-loader';
import { recordLabel } from 'src/utils/record-label.util';

// Fills the choices of every relation field with the records that exist now,
// once per object. The page shows them and a submission is checked against them.
export const loadRelationOptions = async (
  definition: FormDefinition,
  loader: RelationRecordLoader,
): Promise<FormDefinition> => {
  const plurals = [
    ...new Set(
      definition.records.flatMap(({ fields }) =>
        fields.flatMap((field) => (field.relation ? [field.relation.targetObjectNamePlural] : [])),
      ),
    ),
  ];
  const choices = new Map(
    await Promise.all(
      plurals.map(async (plural) => [
        plural,
        (await loader(plural))
          .map((record) => ({ value: record.id, label: recordLabel(record) }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      ] as const),
    ),
  );

  return {
    ...definition,
    records: definition.records.map((record) => ({
      ...record,
      fields: record.fields.map((field) =>
        field.relation ? { ...field, options: choices.get(field.relation.targetObjectNamePlural) ?? [] } : field,
      ),
    })),
  };
};
