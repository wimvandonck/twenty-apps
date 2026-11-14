import { type RecordStore, type StoredRecord } from 'src/types/record-store';

// An in-memory RecordStore for tests. Records are kept per object, in
// insertion order.
export const createMemoryRecordStore = (seed: Record<string, StoredRecord[]> = {}) => {
  const tables: Record<string, StoredRecord[]> = Object.fromEntries(
    Object.entries(seed).map(([name, records]) => [name, records.map((record) => ({ ...record }))]),
  );
  let counter = 0;
  const table = (name: string) => (tables[name] ??= []);

  const store: RecordStore = {
    find: async (name, where, options) => {
      let rows = table(name).filter((row) =>
        Object.entries(where).every(([key, value]) =>
          value === null ? row[key] === null || row[key] === undefined || row[key] === '' : row[key] === value,
        ),
      );

      if (options?.orderBy) {
        const { field, direction } = options.orderBy;
        const sign = direction === 'asc' ? 1 : -1;

        rows = [...rows].sort((a, b) => (String(a[field] ?? '') < String(b[field] ?? '') ? -sign : sign));
      }

      return rows.slice(0, options?.limit ?? rows.length).map((row) => ({ ...row }));
    },
    findOne: async (name, id) => {
      const row = table(name).find((candidate) => candidate.id === id);

      return row ? { ...row } : null;
    },
    create: async (name, data) => {
      counter += 1;
      const row = { id: `${name}-${counter}`, createdAt: new Date(1_800_000_000_000 + counter).toISOString(), ...data };

      table(name).push(row);

      return { ...row };
    },
    update: async (name, id, data) => {
      const row = table(name).find((candidate) => candidate.id === id);

      if (!row) {
        throw new Error(`No ${name} ${id}`);
      }

      Object.assign(row, data);
    },
    remove: async (name, id) => {
      tables[name] = table(name).filter((row) => row.id !== id);
    },
  };

  return { store, tables };
};
