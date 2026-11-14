import { type EditorField, type EditorObject } from 'src/types/editor-metadata';

export type PersonLink = { object: EditorObject; relation: EditorField };

export type MeasurableField = { path: string; label: string; isDate: boolean };

// Every field on another object that points at a person, such as a
// donation's donor or a registration's attendee.
export const personLinks = (objects: EditorObject[]): PersonLink[] =>
  objects
    .filter((object) => object.nameSingular !== 'person')
    .flatMap((object) =>
      object.fields
        .filter((field) => field.type === 'RELATION' && field.relationTarget === 'person')
        .map((relation) => ({ object, relation })),
    )
    .sort((a, b) => a.object.labelPlural.localeCompare(b.object.labelPlural) || a.relation.label.localeCompare(b.relation.label));

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
