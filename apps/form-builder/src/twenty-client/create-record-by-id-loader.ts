import { RestApiClient } from 'twenty-client-sdk/rest';

import { type RecordByIdLoader } from 'src/types/record-by-id-loader';

type OneResponse = { data: Record<string, ({ id: string } & Record<string, unknown>) | null> };

export const createRecordByIdLoader =
  (client: RestApiClient): RecordByIdLoader =>
  async (objectNamePlural, id) => {
    try {
      return Object.values((await client.get<OneResponse>(`/rest/${objectNamePlural}/${id}`)).data)[0] ?? null;
    } catch {
      return null;
    }
  };
