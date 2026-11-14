import { RestApiClient } from 'twenty-client-sdk/rest';

import { type RelationRecordLoader } from 'src/types/relation-record-loader';

type ListResponse = { data: Record<string, Array<{ id: string } & Record<string, unknown>>> };

const MAX_CHOICES = 200;

// Reads the records a relation field can point at over the REST API.
export const createRelationRecordLoader =
  (client: RestApiClient): RelationRecordLoader =>
  async (objectNamePlural, filter) => {
    const response = await client.get<ListResponse>(`/rest/${objectNamePlural}`, {
      query: { limit: MAX_CHOICES, ...(filter ? { filter } : {}) },
    });

    return Object.values(response.data)[0] ?? [];
  };
