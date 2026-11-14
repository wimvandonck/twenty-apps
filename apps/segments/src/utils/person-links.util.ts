import { type EditorField, type EditorObject } from 'src/types/editor-metadata';

// via is the person's own field the link goes through, such as company.
export type PersonLink = { object: EditorObject; relation: EditorField; via?: EditorField };

export const personLinkKey = (object: string, relation: string, via?: string) => `${object}:${relation}:${via ?? ''}`;

export type MeasurableField = { path: string; label: string; isDate: boolean };

const pointsAt = (target: string) => (field: EditorField) => field.type === 'RELATION' && field.relationTarget === target;

// Every field on another object that points at a person, such as a
// donation's donor or a registration's attendee. Then the links one step
// further: records that point at a record the person points at, such as
// the opportunities of the person's company.
export const personLinks = (objects: EditorObject[]): PersonLink[] => {
  const person = objects.find((object) => object.nameSingular === 'person');
  const others = objects.filter((object) => object.nameSingular !== 'person');

  const direct = others.flatMap((object) =>
    object.fields.filter(pointsAt('person')).map((relation) => ({ object, relation })),
  );

  const throughPerson = (person?.fields ?? [])
    .filter((via) => via.type === 'RELATION' && via.relationTarget !== null && via.relationTarget !== 'person')
    .flatMap((via) =>
      others
        .filter((object) => object.nameSingular !== via.relationTarget)
        .flatMap((object) =>
          object.fields.filter(pointsAt(via.relationTarget as string)).map((relation) => ({ object, relation, via })),
        ),
    );

  const byLabel = (a: PersonLink, b: PersonLink) =>
    a.object.labelPlural.localeCompare(b.object.labelPlural) || a.relation.label.localeCompare(b.relation.label);

  return [...direct.sort(byLabel), ...throughPerson.sort(byLabel)];
};

// Fields that can be summed or averaged, and fields whose highest or lowest
// value can be compared. Returns the aggregate field path for each.
export const measurableFields = (
  object: EditorObject,
  aggregate: 'SUM' | 'AVG' | 'MIN' | 'MAX',
): MeasurableField[] =>
  object.fields.flatMap((field): MeasurableField[] => {
    if (field.type === 'CURRENCY') return [{ path: `${field.name}.amountMicros`, label: field.label, isDate: false }];
    if (field.type === 'NUMBER') return [{ path: field.name, label: field.label, isDate: false }];
    if ((aggregate === 'MIN' || aggregate === 'MAX') && (field.type === 'DATE' || field.type === 'DATE_TIME')) {
      return [{ path: field.name, label: field.label, isDate: true }];
    }
    return [];
  });
