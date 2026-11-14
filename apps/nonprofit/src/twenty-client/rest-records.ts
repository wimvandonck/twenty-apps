import { RestApiClient } from 'twenty-client-sdk/rest';

import { fetchAllPages } from 'src/utils/fetch-all-pages.util';

export type RestRecord = { id: string } & Record<string, unknown>;

type OneResponse = { data: Record<string, RestRecord | null> };

// The few REST calls the automations need.
export const restRecords = (client: RestApiClient = new RestApiClient()) => ({
  // Every matching record, past the 200 one call returns.
  list: (namePlural: string, filter: string, max = 10_000): Promise<RestRecord[]> =>
    fetchAllPages<RestRecord>((path, query) => client.get(path, { query }), `/rest/${namePlural}`, { filter }, max),
  get: async (namePlural: string, id: string): Promise<RestRecord | null> => {
    try {
      const response = await client.get<OneResponse>(`/rest/${namePlural}/${id}`);

      return Object.values(response.data)[0] ?? null;
    } catch {
      return null;
    }
  },
  update: async (namePlural: string, id: string, data: Record<string, unknown>): Promise<void> => {
    await client.patch(`/rest/${namePlural}/${id}`, data);
  },
});
