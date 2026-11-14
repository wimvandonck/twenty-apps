// A segment's definition, stored as JSON on the segment.
//
// Filters use Twenty's GraphQL filter format, for example
// { "status": { "eq": "RECEIVED" } }. Text such as "@today-12M" or
// "@now-7d" in a filter or value is replaced by that date when the
// segment is calculated.

export type Match = 'ALL' | 'ANY';

export type Operator = 'GTE' | 'GT' | 'LTE' | 'LT' | 'EQ' | 'NEQ';

export type Aggregate = 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';

export type Measure =
  | { aggregate: 'COUNT' }
  // field is the path of a number, currency or date field, such as
  // "amount.amountMicros" or "receivedOn". For amountMicros the value is
  // given in whole currency units.
  | { aggregate: Exclude<Aggregate, 'COUNT'>; field: string };

// People with linked records of another object, for example donations.
export type RelatedCondition = {
  type: 'related';
  // Plural API name of the linked object, such as "donations".
  object: string;
  // Field on that object that points at the person, such as "donor".
  relation: string;
  // A saved view on that object whose filters apply.
  viewId?: string;
  filter?: Record<string, unknown>;
  // Defaults to counting the records.
  measure?: Measure;
  // Defaults to at least one record: GTE 1.
  operator?: Operator;
  value?: number | string;
};

// People matching a filter on their own fields.
export type PropertyCondition = {
  type: 'property';
  filter: Record<string, unknown>;
};

// People who are, or are not, on a list.
export type ListCondition = {
  type: 'list';
  listId: string;
  isMember?: boolean;
};

export type GroupCondition = {
  type: 'group';
  match: Match;
  conditions: Condition[];
};

export type Condition = RelatedCondition | PropertyCondition | ListCondition | GroupCondition;

export type SegmentDefinition = {
  match: Match;
  conditions: Condition[];
};
