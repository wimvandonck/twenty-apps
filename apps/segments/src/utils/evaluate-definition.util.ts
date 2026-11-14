import {
  type Condition,
  type Measure,
  type Operator,
  type RelatedCondition,
  type SegmentDefinition,
} from 'src/types/segment-definition';
import { type SegmentDeps } from 'src/types/segment-deps';
import { resolveRelativeDate, resolveRelativeDates } from 'src/utils/resolve-relative-dates.util';

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// "SUM" of "amount.amountMicros" is the GraphQL field sumAmountAmountMicros.
export const aggregateFieldName = (measure: Measure): string =>
  measure.aggregate === 'COUNT'
    ? 'totalCount'
    : measure.aggregate.toLowerCase() + measure.field.split('.').map(capitalize).join('');

// Amounts are stored in millionths; definitions use whole units.
const toComparable = (measure: Measure, value: number | string, now: Date): number => {
  if (typeof value === 'string') {
    const resolved = resolveRelativeDate(value, now);
    const time = Date.parse(resolved);

    if (Number.isNaN(time)) {
      throw new Error(`"${value}" is not a number or a date`);
    }

    return time;
  }

  return measure.aggregate !== 'COUNT' && measure.field.endsWith('amountMicros') ? value * 1_000_000 : value;
};

const compare = (actual: number, operator: Operator, expected: number): boolean => {
  switch (operator) {
    case 'GTE':
      return actual >= expected;
    case 'GT':
      return actual > expected;
    case 'LTE':
      return actual <= expected;
    case 'LT':
      return actual < expected;
    case 'EQ':
      return actual === expected;
    case 'NEQ':
      return actual !== expected;
  }
};

const intersect = (sets: Set<string>[]): Set<string> => {
  if (sets.length === 0) {
    return new Set();
  }

  const [first, ...rest] = sets;

  return new Set([...first].filter((id) => rest.every((set) => set.has(id))));
};

const union = (sets: Set<string>[]): Set<string> => new Set(sets.flatMap((set) => [...set]));

type Context = { deps: SegmentDeps; now: Date; allPersonIds?: Promise<Set<string>> };

const everyone = (context: Context): Promise<Set<string>> => {
  context.allPersonIds ??= context.deps.findAllPersonIds().then((ids) => new Set(ids));

  return context.allPersonIds;
};

const evaluateRelated = async (condition: RelatedCondition, context: Context): Promise<Set<string>> => {
  const measure = condition.measure ?? { aggregate: 'COUNT' };
  const operator = condition.operator ?? 'GTE';
  const expected = toComparable(measure, condition.value ?? 1, context.now);

  const { values: grouped } = await context.deps.groupRelated({
    object: condition.object,
    relation: condition.relation,
    viewId: condition.viewId,
    filter: condition.filter ? resolveRelativeDates(condition.filter, context.now) : undefined,
    aggregateField: aggregateFieldName(measure),
  });

  // With via, the records were grouped per linked record, such as per
  // company; each person takes the value of their own linked record.
  const values = condition.via ? new Map<string, number>() : grouped;

  if (condition.via) {
    for (const [personId, linkedId] of await context.deps.findPersonLinks(condition.via)) {
      const value = grouped.get(linkedId);

      if (value !== undefined) {
        values.set(personId, value);
      }
    }
  }

  const matched = new Set(
    [...values].filter(([, value]) => compare(value, operator, expected)).map(([id]) => id),
  );

  // People without any linked record count as 0 for a count or a sum, so
  // "no donations" or "fewer than 3 registrations" includes them.
  const zeroMatches = (measure.aggregate === 'COUNT' || measure.aggregate === 'SUM') && compare(0, operator, expected);

  if (zeroMatches) {
    for (const id of await everyone(context)) {
      if (!values.has(id)) {
        matched.add(id);
      }
    }
  }

  return matched;
};

const evaluateCondition = async (condition: Condition, context: Context): Promise<Set<string>> => {
  switch (condition.type) {
    case 'related':
      return evaluateRelated(condition, context);
    case 'property':
      return new Set(await context.deps.findPersonIds(resolveRelativeDates(condition.filter, context.now)));
    case 'list': {
      const members = new Set(await context.deps.findListMemberIds(condition.listId));

      if (condition.isMember ?? true) {
        return members;
      }

      return new Set([...(await everyone(context))].filter((id) => !members.has(id)));
    }
    case 'group':
      return evaluateGroup(condition.match, condition.conditions, context);
  }
};

const evaluateGroup = async (
  match: SegmentDefinition['match'],
  conditions: Condition[],
  context: Context,
): Promise<Set<string>> => {
  const sets: Set<string>[] = [];

  for (const condition of conditions) {
    sets.push(await evaluateCondition(condition, context));
  }

  return match === 'ANY' ? union(sets) : intersect(sets);
};

// The ids of the people who meet the definition.
export const evaluateDefinition = async (
  definition: SegmentDefinition,
  deps: SegmentDeps,
  now: Date = new Date(),
): Promise<Set<string>> => evaluateGroup(definition.match, definition.conditions, { deps, now });
