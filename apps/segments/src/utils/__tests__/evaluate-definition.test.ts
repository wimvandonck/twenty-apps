import { describe, expect, it } from 'vitest';

import { type GroupRequest, type SegmentDeps } from 'src/types/segment-deps';
import { aggregateFieldName, evaluateDefinition } from 'src/utils/evaluate-definition.util';

const NOW = new Date('2026-11-14T12:00:00Z');

// Donations per person: an has 60 euro in two gifts, bram 25 in one,
// charlotte 100 in one. dries has none.
const donations: Record<string, Record<string, number>> = {
  totalCount: { an: 2, bram: 1, charlotte: 1 },
  sumAmountAmountMicros: { an: 60_000_000, bram: 25_000_000, charlotte: 100_000_000 },
};

const createDeps = (overrides: Partial<SegmentDeps> = {}) => {
  const requests: GroupRequest[] = [];
  const deps: SegmentDeps = {
    groupRelated: async (request) => {
      requests.push(request);
      return { values: new Map(Object.entries(donations[request.aggregateField] ?? {})) };
    },
    findPersonIds: async (filter) => (JSON.stringify(filter).includes('Brussel') ? ['an', 'dries'] : []),
    findListMemberIds: async () => ['bram'],
    findAllPersonIds: async () => ['an', 'bram', 'charlotte', 'dries'],
    ...overrides,
  };

  return { deps, requests };
};

const sorted = (set: Set<string>) => [...set].sort();

describe('aggregateFieldName', () => {
  it('names counts and aggregates as Twenty does', () => {
    expect(aggregateFieldName({ aggregate: 'COUNT' })).toBe('totalCount');
    expect(aggregateFieldName({ aggregate: 'SUM', field: 'amount.amountMicros' })).toBe('sumAmountAmountMicros');
    expect(aggregateFieldName({ aggregate: 'MAX', field: 'receivedOn' })).toBe('maxReceivedOn');
  });
});

describe('evaluateDefinition', () => {
  it('counts linked records, at least one by default', async () => {
    const { deps } = createDeps();
    const result = await evaluateDefinition(
      { match: 'ALL', conditions: [{ type: 'related', object: 'donations', relation: 'donor' }] },
      deps,
      NOW,
    );

    expect(sorted(result)).toEqual(['an', 'bram', 'charlotte']);
  });

  it('compares sums of amounts in whole euros', async () => {
    const { deps } = createDeps();
    const result = await evaluateDefinition(
      {
        match: 'ALL',
        conditions: [
          {
            type: 'related',
            object: 'donations',
            relation: 'donor',
            measure: { aggregate: 'SUM', field: 'amount.amountMicros' },
            operator: 'GTE',
            value: 50,
          },
        ],
      },
      deps,
      NOW,
    );

    expect(sorted(result)).toEqual(['an', 'charlotte']);
  });

  it('includes people without linked records when zero matches', async () => {
    const { deps } = createDeps();
    const result = await evaluateDefinition(
      { match: 'ALL', conditions: [{ type: 'related', object: 'donations', relation: 'donor', operator: 'EQ', value: 0 }] },
      deps,
      NOW,
    );

    expect(sorted(result)).toEqual(['dries']);
  });

  it('combines conditions with ALL and ANY', async () => {
    const { deps } = createDeps();
    const bigDonors = {
      type: 'related' as const,
      object: 'donations',
      relation: 'donor',
      measure: { aggregate: 'SUM' as const, field: 'amount.amountMicros' },
      value: 50,
    };
    const brussels = { type: 'property' as const, filter: { city: { eq: 'Brussel' } } };

    expect(sorted(await evaluateDefinition({ match: 'ALL', conditions: [bigDonors, brussels] }, deps, NOW))).toEqual(['an']);
    expect(sorted(await evaluateDefinition({ match: 'ANY', conditions: [bigDonors, brussels] }, deps, NOW))).toEqual([
      'an',
      'charlotte',
      'dries',
    ]);
  });

  it('nests groups', async () => {
    const { deps } = createDeps();
    const result = await evaluateDefinition(
      {
        match: 'ALL',
        conditions: [
          { type: 'list', listId: 'newsletter', isMember: false },
          {
            type: 'group',
            match: 'ANY',
            conditions: [
              { type: 'related', object: 'donations', relation: 'donor', operator: 'GTE', value: 2 },
              { type: 'property', filter: { city: { eq: 'Brussel' } } },
            ],
          },
        ],
      },
      deps,
      NOW,
    );

    expect(sorted(result)).toEqual(['an', 'dries']);
  });

  it('resolves relative dates in filters before asking Twenty', async () => {
    const { deps, requests } = createDeps();
    await evaluateDefinition(
      {
        match: 'ALL',
        conditions: [
          { type: 'related', object: 'donations', relation: 'donor', filter: { receivedOn: { gte: '@today-12M' } } },
        ],
      },
      deps,
      NOW,
    );

    expect(requests[0].filter).toEqual({ receivedOn: { gte: '2025-11-14' } });
  });

  it('compares dates given as relative values', async () => {
    const { deps } = createDeps({
      groupRelated: async () => ({
        values: new Map([
          ['an', Date.parse('2026-10-01')],
          ['bram', Date.parse('2024-01-01')],
        ]),
      }),
    });
    const result = await evaluateDefinition(
      {
        match: 'ALL',
        conditions: [
          {
            type: 'related',
            object: 'donations',
            relation: 'donor',
            measure: { aggregate: 'MAX', field: 'receivedOn' },
            operator: 'GTE',
            value: '@today-1y',
          },
        ],
      },
      deps,
      NOW,
    );

    expect(sorted(result)).toEqual(['an']);
  });

  it('only loads everyone when a condition needs it', async () => {
    let loaded = 0;
    const { deps } = createDeps({
      findAllPersonIds: async () => {
        loaded += 1;
        return ['an'];
      },
    });

    await evaluateDefinition({ match: 'ALL', conditions: [{ type: 'related', object: 'donations', relation: 'donor' }] }, deps, NOW);
    expect(loaded).toBe(0);
  });
});
