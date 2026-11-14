import { type FieldMetadata } from 'src/types/field-metadata';
import { type FormPicker } from 'src/types/form-picker';
import { type FormRecord } from 'src/types/form-record';
import { type ObjectMetadata } from 'src/types/object-metadata';

const isManyToOne = (field: FieldMetadata) =>
  field.isActive && field.type === 'RELATION' && field.relationType === 'MANY_TO_ONE' && field.joinColumnName !== null;

const byNames = (fields: FieldMetadata[], type: string, names: string[]) =>
  names.map((name) => fields.find((field) => field.isActive && field.type === type && field.name === name)).find(Boolean);

// A picker for choosing records of one object, each choice becoming a record
// of another, with every connection worked out from the data model: which
// column points at the choice, the price and quantity fields, the records of
// the form it belongs to and columns to copy from the choice. Null when the
// line object cannot point at the source object.
export const suggestPicker = (
  key: string,
  source: ObjectMetadata,
  line: ObjectMetadata,
  records: FormRecord[],
): FormPicker | null => {
  const relations = line.fields.filter(isManyToOne);
  const sourceRelation = relations.find((field) => field.relationTargetObjectNameSingular === source.nameSingular);

  if (!sourceRelation?.joinColumnName) {
    return null;
  }

  const price =
    byNames(source.fields, 'CURRENCY', ['price', 'amount', 'fee']) ??
    source.fields.find((field) => field.isActive && field.type === 'CURRENCY');
  const availability = byNames(source.fields, 'BOOLEAN', ['isAvailable', 'isActive']);
  const quantity = byNames(line.fields, 'NUMBER', ['quantity']);
  const unitPrice =
    byNames(line.fields, 'CURRENCY', ['unitPrice', 'amount', 'price']) ??
    line.fields.find((field) => field.isActive && field.type === 'CURRENCY');
  const lineTotal = byNames(line.fields, 'CURRENCY', ['lineTotal', 'total']);
  const others = relations.filter((field) => field !== sourceRelation);
  const links = others.flatMap((field) => {
    const target = records.find(({ objectNameSingular }) => objectNameSingular === field.relationTargetObjectNameSingular);

    return target && field.joinColumnName ? [{ joinColumnName: field.joinColumnName, recordKey: target.key }] : [];
  });
  const sourceRelations = source.fields.filter(isManyToOne);
  const copies = others.flatMap((field) => {
    const match = sourceRelations.find(
      (candidate) => candidate.relationTargetObjectNameSingular === field.relationTargetObjectNameSingular,
    );
    const isLinked = links.some(({ joinColumnName }) => joinColumnName === field.joinColumnName);

    return match?.joinColumnName && field.joinColumnName && !isLinked
      ? [{ sourceJoinColumnName: match.joinColumnName, lineJoinColumnName: field.joinColumnName }]
      : [];
  });

  return {
    key,
    label: source.labelPlural,
    required: false,
    single: false,
    maxQuantity: 10,
    source: {
      objectNamePlural: source.namePlural,
      priceFieldName: price?.name ?? null,
      filters: availability ? [{ fieldName: availability.name, value: true }] : [],
    },
    line: {
      objectNamePlural: line.namePlural,
      sourceJoinColumnName: sourceRelation.joinColumnName,
      quantityFieldName: quantity?.name ?? null,
      unitPriceFieldName: unitPrice?.name ?? null,
      lineTotalFieldName: lineTotal && lineTotal !== unitPrice ? lineTotal.name : null,
      links,
      copies,
    },
  };
};
