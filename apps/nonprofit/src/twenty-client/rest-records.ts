import { RestApiClient } from 'twenty-client-sdk/rest';

export type RestRecord = { id: string } & Record<string, unknown>;

type ListResponse = { data: Record<string, RestRecord[]> };
type OneResponse = { data: Record<string, RestRecord | null> };

// The few REST calls the automations need.
export const restRecords = (client: RestApiClient = new RestApiClient()) => ({
  list: async (namePlural: string, filter: string, limit = 200): Promise<RestRecord[]> => {
    const response = await client.get<ListResponse>(`/rest/${namePlural}`, { query: { filter, limit } });

    return Object.values(response.data)[0] ?? [];
  },
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
