// The record operations a submission needs, so the flow can be tested
// without a Twenty server.
export type RecordApi = {
  findIdByFilter: (objectNamePlural: string, filter: string) => Promise<string | null>;
  create: (objectNamePlural: string, data: Record<string, unknown>) => Promise<string>;
  update: (objectNamePlural: string, id: string, data: Record<string, unknown>) => Promise<void>;
  remove: (objectNamePlural: string, id: string) => Promise<void>;
};
