import { type FormLink } from 'src/types/form-link';
import { type FormRecord } from 'src/types/form-record';
import { type ObjectMetadata } from 'src/types/object-metadata';

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const findObject = (objects: ObjectMetadata[], nameSingular: string | null) =>
  objects.find((object) => object.nameSingular === nameSingular);

// Relation fields on `source` that point straight at `target`.
const getDirectPaths = (source: FormRecord, target: FormRecord, objects: ObjectMetadata[]): FormLink[] =>
  (findObject(objects, source.objectNameSingular)?.fields ?? [])
    .filter(
      (field) =>
        field.isActive &&
        !field.isUIReadOnly &&
        field.type === 'RELATION' &&
        field.relationType === 'MANY_TO_ONE' &&
        field.joinColumnName !== null &&
        field.relationTargetObjectNameSingular === target.objectNameSingular,
    )
    .map((field) => ({
      kind: 'DIRECT',
      sourceRecordKey: source.key,
      relationFieldName: field.name,
      joinColumnName: field.joinColumnName as string,
      targetRecordKey: target.key,
    }));

// Junction objects `source` owns (e.g. note -> noteTargets) that can point
// at `target`'s object.
const getJunctionPaths = (source: FormRecord, target: FormRecord, objects: ObjectMetadata[]): FormLink[] =>
  (findObject(objects, source.objectNameSingular)?.fields ?? []).flatMap((field) => {
    const junction = findObject(objects, field.relationTargetObjectNameSingular);
    const targetField = junction?.fields.find(({ id }) => id === field.junctionTargetFieldId);
    const sourceField = junction?.fields.find(
      (candidate) =>
        candidate.joinColumnName !== null &&
        candidate.relationTargetObjectNameSingular === source.objectNameSingular,
    );

    if (!field.isActive || junction === undefined || targetField === undefined || sourceField === undefined) {
      return [];
    }

    // A morph relation stores one join column per object it can point at.
    const targetJoinColumnName =
      targetField.type === 'MORPH_RELATION'
        ? targetField.morphTargetObjectNamesSingular.includes(target.objectNameSingular)
          ? `${targetField.name}${capitalize(target.objectNameSingular)}Id`
          : null
        : targetField.relationTargetObjectNameSingular === target.objectNameSingular
          ? targetField.joinColumnName
          : null;

    return targetJoinColumnName === null
      ? []
      : [
          {
            kind: 'JUNCTION' as const,
            junctionObjectNamePlural: junction.namePlural,
            sourceRecordKey: source.key,
            sourceJoinColumnName: sourceField.joinColumnName as string,
            targetRecordKey: target.key,
            targetJoinColumnName,
          },
        ];
  });

// Every way two records of a form can be linked, in either direction.
export const getLinkPaths = (a: FormRecord, b: FormRecord, objects: ObjectMetadata[]): FormLink[] =>
  a.key === b.key
    ? []
    : [
        ...getDirectPaths(a, b, objects),
        ...getDirectPaths(b, a, objects),
        ...getJunctionPaths(a, b, objects),
        ...getJunctionPaths(b, a, objects),
      ];
