import { describe, expect, it, vi } from 'vitest';

import { fetchAllPages, type PageGetter } from 'src/utils/fetch-all-pages.util';

const pages = (total: number) =>
  vi.fn(async (_path: string, query: Record<string, string | number>) => {
    const start = query.starting_after ? Number(query.starting_after) : 0;
    const end = Math.min(start + Number(query.limit), total);

    return {
      data: { items: Array.from({ length: end - start }, (_, index) => ({ id: start + index })) },
      pageInfo: { hasNextPage: end < total, endCursor: String(end) },
    };
  });

describe('fetchAllPages', () => {
  it('follows the cursor past the 200 records of one call', async () => {
    const get = pages(450);
    const records = await fetchAllPages<{ id: number }>(get as unknown as PageGetter, '/rest/items', { filter: 'x' });

    expect(records).toHaveLength(450);
    expect(get).toHaveBeenCalledTimes(3);
    expect(get.mock.calls[0][1]).toEqual({ filter: 'x', limit: 200 });
    expect(get.mock.calls[1][1]).toEqual({ filter: 'x', limit: 200, starting_after: '200' });
  });

  it('stops at the maximum', async () => {
    expect(await fetchAllPages(pages(1000) as unknown as PageGetter, '/rest/items', {}, 250)).toHaveLength(250);
  });
});
