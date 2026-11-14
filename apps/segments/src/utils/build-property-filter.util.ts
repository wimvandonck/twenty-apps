import { type PropertyOperator } from 'src/types/segment-definition';

// The part of a composite field that holds the value people search on.
const SUBFIELDS: Record<string, string> = {
  EMAILS: 'primaryEmail',
  PHONES: 'primaryPhoneNumber',
  LINKS: 'primaryLinkUrl',
  ADDRESS: 'addressCity',
};

export const TEXT_TYPES = ['TEXT', 'EMAILS', 'PHONES', 'LINKS', 'ADDRESS'];
export const PROPERTY_FIELD_TYPES = [...TEXT_TYPES, 'NUMBER', 'SELECT', 'MULTI_SELECT', 'BOOLEAN', 'DATE', 'DATE_TIME'];

// Which operators make sense for a field type.
export const operatorsFor = (type: string): PropertyOperator[] => {
  if (TEXT_TYPES.includes(type)) return ['CONTAINS', 'IS', 'IS_NOT', 'IS_EMPTY', 'IS_NOT_EMPTY'];
  if (type === 'NUMBER') return ['IS', 'IS_NOT', 'GTE', 'LTE', 'IS_EMPTY', 'IS_NOT_EMPTY'];
  if (type === 'SELECT') return ['IS', 'IS_NOT', 'IS_EMPTY', 'IS_NOT_EMPTY'];
  if (type === 'MULTI_SELECT') return ['CONTAINS', 'IS_EMPTY', 'IS_NOT_EMPTY'];
  if (type === 'BOOLEAN') return ['IS'];
  if (type === 'DATE' || type === 'DATE_TIME') return ['GTE', 'LTE', 'IS_EMPTY', 'IS_NOT_EMPTY'];
  return [];
};

export const needsValue = (operator: PropertyOperator) => operator !== 'IS_EMPTY' && operator !== 'IS_NOT_EMPTY';

// Builds Twenty's GraphQL filter for one condition on a person's own field.
export const buildPropertyFilter = (
  field: string,
  type: string,
  operator: PropertyOperator,
  value: string,
): Record<string, unknown> => {
  const wrap = (test: Record<string, unknown>) =>
    SUBFIELDS[type] ? { [field]: { [SUBFIELDS[type]]: test } } : { [field]: test };

  if (operator === 'IS_EMPTY') return wrap({ is: 'NULL' });
  if (operator === 'IS_NOT_EMPTY') return wrap({ is: 'NOT_NULL' });

  if (type === 'MULTI_SELECT') return wrap({ containsAny: [value] });

  const typed: unknown =
    type === 'NUMBER' ? Number(value) : type === 'BOOLEAN' ? value === 'true' : value;

  switch (operator) {
    case 'CONTAINS':
      return wrap({ ilike: `%${value}%` });
    case 'IS':
      return wrap(TEXT_TYPES.includes(type) ? { ilike: value } : { eq: typed });
    case 'IS_NOT':
      return wrap({ neq: typed });
    case 'GTE':
      return wrap({ gte: typed });
    case 'LTE':
      return wrap({ lte: typed });
  }
};
