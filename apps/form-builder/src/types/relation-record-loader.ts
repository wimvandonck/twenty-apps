// Reads the records a relation field can point at, so forms can be tested
// without a Twenty server.
export type RelationRecordLoader = (
  objectNamePlural: string,
  filter?: string,
) => Promise<Array<{ id: string } & Record<string, unknown>>>;
