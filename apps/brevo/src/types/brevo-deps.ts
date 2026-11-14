export type PersonContact = { id: string; email: string | null; firstName: string; lastName: string };

export type SyncedList = { id: string; name: string; isSynced: boolean; brevoListId: number | null };

// What the flows need from Twenty.
export type TwentyDeps = {
  getPerson: (personId: string) => Promise<PersonContact | null>;
  // Email type name -> whether the person has consent, for every consent of the person.
  getConsents: (personId: string) => Promise<Array<{ emailTypeName: string; isGranted: boolean }>>;
  getList: (listId: string) => Promise<SyncedList | null>;
  getSyncedLists: () => Promise<SyncedList[]>;
  setBrevoListId: (listId: string, brevoListId: number) => Promise<void>;
  getMemberPersonIds: (listId: string) => Promise<string[]>;
  findPersonIdByEmail: (email: string) => Promise<string | null>;
  withdrawAllConsents: (personId: string) => Promise<void>;
  getListsByBrevoIds: (brevoListIds: number[]) => Promise<SyncedList[]>;
  removeMembership: (listId: string, personId: string) => Promise<void>;
};

// What the flows need from Brevo.
export type BrevoDeps = {
  ensureBooleanAttribute: (name: string) => Promise<void>;
  createList: (name: string) => Promise<number>;
  upsertContact: (body: object) => Promise<void>;
  removeFromList: (brevoListId: number, emails: string[]) => Promise<void>;
};
