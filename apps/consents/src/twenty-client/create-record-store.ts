import { RestApiClient } from 'twenty-client-sdk/rest';

import { type RecordStore, type StoredRecord } from 'src/types/record-store';
import { buildRestFilter } from 'src/utils/build-rest-filter.util';

type ListResponse = { data: Record<string, StoredRecord[]> };
type OneResponse = { data: Record<string, StoredRecord | null> };

const first = <T>(data: Record<string, T>): T | undefined => Object.values(data)[0];

// Record operations over Twenty's REST API.
export const createRecordStore = (client: RestApiClient = new RestApiClient()): RecordStore => ({
  find: async (name, where, options) => {
    const query: Record<string, string | number> = { limit: options?.limit ?? 60 };
    const filter = buildRestFilter(where);

    if (filter) {
      query.filter = filter;
    }

    if (options?.orderBy) {
      const direction = options.orderBy.direction === 'asc' ? 'AscNullsFirst' : 'DescNullsLast';

      query.order_by = `${options.orderBy.field}[${direction}]`;
    }

    const response = await client.get<ListResponse>(`/rest/${name}`, { query });

    return first(response.data) ?? [];
  },
  findOne: async (name, id) => {
    try {
      const response = await client.get<OneResponse>(`/rest/${name}/${id}`);

      return first(response.data) ?? null;
    } catch {
      return null;
    }
  },
  create: async (name, data) => {
    const response = await client.post<OneResponse>(`/rest/${name}`, data);
    const record = first(response.data);

    if (!record) {
      throw new Error(`Creating a record in ${name} returned nothing`);
    }

    return record;
  },
  update: async (name, id, data) => {
    await client.patch(`/rest/${name}/${id}`, data);
  },
  remove: async (name, id) => {
    await client.delete(`/rest/${name}/${id}`);
  },
});
