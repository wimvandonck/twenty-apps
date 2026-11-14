type Page<T> = { data: Record<string, T[]>; pageInfo?: { hasNextPage?: boolean; endCursor?: string | null } };

export type PageGetter = <T>(path: string, query: Record<string, string | number>) => Promise<Page<T>>;

// Twenty's REST API returns at most 200 records per call. This follows the
// cursor until every record is read, or until max records.
export const fetchAllPages = async <T>(
  get: PageGetter,
  path: string,
  query: Record<string, string | number> = {},
  max = 10_000,
): Promise<T[]> => {
  const records: T[] = [];
  let cursor: string | null | undefined;

  do {
    const page = await get<T>(path, { ...query, limit: Math.min(200, max - records.length), ...(cursor ? { starting_after: cursor } : {}) });

    records.push(...(Object.values(page.data)[0] ?? []));
    cursor = page.pageInfo?.hasNextPage ? page.pageInfo.endCursor : null;
  } while (cursor && records.length < max);

  return records;
};
