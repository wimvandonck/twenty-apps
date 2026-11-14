// Field values a record must equal. null matches an empty field.
export type RecordWhere = Record<string, string | boolean | null>;

export type RecordFindOptions = {
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
};

export type StoredRecord = { id: string } & Record<string, unknown>;

// The record operations the app needs, so its flows can be tested without a
// Twenty server.
export type RecordStore = {
  find: (objectNamePlural: string, where: RecordWhere, options?: RecordFindOptions) => Promise<StoredRecord[]>;
  findOne: (objectNamePlural: string, id: string) => Promise<StoredRecord | null>;
  create: (objectNamePlural: string, data: Record<string, unknown>) => Promise<StoredRecord>;
  update: (objectNamePlural: string, id: string, data: Record<string, unknown>) => Promise<void>;
  remove: (objectNamePlural: string, id: string) => Promise<void>;
};
