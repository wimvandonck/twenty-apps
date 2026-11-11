import { RestApiClient } from 'twenty-client-sdk/rest';

import { LIST_OBJECT_NAME_PLURAL } from 'src/constants/list-objects';
import { type ListSummary } from 'src/types/list-summary';

type ListsResponse = {
  data: Record<string, Array<{ id: string; name: string | null }>>;
};

// The workspace's lists, or null when it has no lists at all (an older
// Twenty) or they cannot be read. Forms work without them.
export const fetchLists = async (client: RestApiClient): Promise<ListSummary[] | null> => {
  try {
    const response = await client.get<ListsResponse>(`/rest/${LIST_OBJECT_NAME_PLURAL}`, {
      query: { limit: 200 },
    });

    return (Object.values(response.data)[0] ?? [])
      .map(({ id, name }) => ({ id, name: name ?? '' }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return null;
  }
};
