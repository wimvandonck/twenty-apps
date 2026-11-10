import { type FormLink } from 'src/types/form-link';
import { type FormRecord } from 'src/types/form-record';
import { type ObjectMetadata } from 'src/types/object-metadata';

// Every way two records of the form can be linked: a many-to-one relation
// field on one record whose target object is another record of the form.
export const getAvailableLinks = (
  records: FormRecord[],
  objects: ObjectMetadata[],
): FormLink[] =>
  records.flatMap((source) => {
    const object = objects.find(
      ({ nameSingular }) => nameSingular === source.objectNameSingular,
    );

    return (object?.fields ?? [])
      .filter(
        (field) =>
          field.isActive &&
          !field.isUIReadOnly &&
          field.relationType === 'MANY_TO_ONE' &&
          field.joinColumnName !== null,
      )
      .flatMap((field) =>
        records
          .filter(
            (target) =>
              target.key !== source.key &&
              target.objectNameSingular ===
                field.relationTargetObjectNameSingular,
          )
          .map((target) => ({
            sourceRecordKey: source.key,
            relationFieldName: field.name,
            joinColumnName: field.joinColumnName as string,
            targetRecordKey: target.key,
          })),
      );
  });
