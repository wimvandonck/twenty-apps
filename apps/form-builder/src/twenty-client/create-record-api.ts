import { RestApiClient } from 'twenty-client-sdk/rest';

import { type RecordApi } from 'src/types/record-api';

type RecordResponse = { data: Record<string, { id: string }> };
type RecordListResponse = { data: Record<string, Array<{ id: string }>> };

// Record operations over the REST API, which addresses objects by name and so
// works for whatever objects a form targets.
export const createRecordApi = (client: RestApiClient): RecordApi => ({
  findIdByFilter: async (objectNamePlural, filter) => {
    const response = await client.get<RecordListResponse>(`/rest/${objectNamePlural}`, {
      query: { filter, limit: 1 },
    });

    return Object.values(response.data)[0]?.[0]?.id ?? null;
  },
  create: async (objectNamePlural, data) => {
    const response = await client.post<RecordResponse>(`/rest/${objectNamePlural}`, data);

    return Object.values(response.data)[0].id;
  },
  update: async (objectNamePlural, id, data) => {
    await client.patch(`/rest/${objectNamePlural}/${id}`, data);
  },
  remove: async (objectNamePlural, id) => {
    await client.delete(`/rest/${objectNamePlural}/${id}`);
  },
});
