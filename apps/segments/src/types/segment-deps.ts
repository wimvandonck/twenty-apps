export type GroupedValues = {
  // Person id to the measured value, with dates as milliseconds since 1970.
  // People without linked records are absent.
  values: Map<string, number>;
};

export type GroupRequest = {
  object: string;
  relation: string;
  viewId?: string;
  filter?: Record<string, unknown>;
  // The aggregate's GraphQL field name, such as "sumAmountAmountMicros",
  // or "totalCount" for counting.
  aggregateField: string;
};

// What the engine reads from Twenty.
export type SegmentDeps = {
  groupRelated: (request: GroupRequest) => Promise<GroupedValues>;
  findPersonIds: (filter: Record<string, unknown>) => Promise<string[]>;
  findListMemberIds: (listId: string) => Promise<string[]>;
  findAllPersonIds: () => Promise<string[]>;
};
