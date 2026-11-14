// Reads one record by id, or null when it does not exist.
export type RecordByIdLoader = (
  objectNamePlural: string,
  id: string,
) => Promise<({ id: string } & Record<string, unknown>) | null>;
