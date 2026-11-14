import { type Condition, type SegmentDefinition } from 'src/types/segment-definition';

const MATCHES = ['ALL', 'ANY'];
const OPERATORS = ['GTE', 'GT', 'LTE', 'LT', 'EQ', 'NEQ'];
const AGGREGATES = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const checkConditions = (conditions: unknown, path: string): Condition[] => {
  if (!Array.isArray(conditions) || conditions.length === 0) {
    throw new Error(`${path}: add at least one condition`);
  }

  return conditions.map((condition, index) => checkCondition(condition, `${path} ${index + 1}`));
};

const checkCondition = (condition: unknown, path: string): Condition => {
  if (!isObject(condition)) {
    throw new Error(`${path}: a condition must be an object`);
  }

  switch (condition.type) {
    case 'related': {
      if (typeof condition.object !== 'string' || typeof condition.relation !== 'string') {
        throw new Error(`${path}: give the linked object and the field that points at the person`);
      }

      if (condition.operator !== undefined && !OPERATORS.includes(String(condition.operator))) {
        throw new Error(`${path}: unknown operator "${String(condition.operator)}"`);
      }

      const measure = condition.measure;

      if (measure !== undefined) {
        if (!isObject(measure) || !AGGREGATES.includes(String(measure.aggregate))) {
          throw new Error(`${path}: measure needs an aggregate: COUNT, SUM, AVG, MIN or MAX`);
        }

        if (measure.aggregate !== 'COUNT' && typeof measure.field !== 'string') {
          throw new Error(`${path}: ${String(measure.aggregate)} needs a field`);
        }
      }

      return condition as Condition;
    }
    case 'property':
      if (!isObject(condition.filter)) {
        throw new Error(`${path}: a property condition needs a filter`);
      }

      return condition as Condition;
    case 'list':
      if (typeof condition.listId !== 'string') {
        throw new Error(`${path}: a list condition needs a listId`);
      }

      return condition as Condition;
    case 'group':
      if (!MATCHES.includes(String(condition.match))) {
        throw new Error(`${path}: a group needs match ALL or ANY`);
      }

      return { type: 'group', match: condition.match as 'ALL' | 'ANY', conditions: checkConditions(condition.conditions, path) };
    default:
      throw new Error(`${path}: unknown condition type "${String(condition.type)}"`);
  }
};

// Checks a definition stored as JSON and explains what is wrong.
export const parseDefinition = (value: unknown): SegmentDefinition => {
  const definition = typeof value === 'string' ? JSON.parse(value) : value;

  if (!isObject(definition)) {
    throw new Error('Add a definition');
  }

  if (!MATCHES.includes(String(definition.match))) {
    throw new Error('The definition needs match ALL or ANY');
  }

  return {
    match: definition.match as 'ALL' | 'ANY',
    conditions: checkConditions(definition.conditions, 'Condition'),
  };
};
