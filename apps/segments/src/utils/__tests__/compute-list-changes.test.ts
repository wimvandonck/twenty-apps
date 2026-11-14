import { describe, expect, it } from 'vitest';

import { computeListChanges } from 'src/utils/compute-list-changes.util';

const set = (...ids: string[]) => new Set(ids);

describe('computeListChanges', () => {
  it('adds everyone who matches on the first calculation', () => {
    expect(computeListChanges(set('a', 'b'), set(), set(), false)).toEqual({ add: ['a', 'b'], remove: [] });
  });

  it('adds new matches and removes people who no longer match', () => {
    expect(computeListChanges(set('a', 'c'), set('a', 'b'), set('a', 'b'), false)).toEqual({ add: ['c'], remove: ['b'] });
  });

  it('does not put back someone removed by hand who still matches', () => {
    expect(computeListChanges(set('a', 'b'), set('a', 'b'), set('a'), false)).toEqual({ add: [], remove: [] });
  });

  it('leaves people added by hand alone', () => {
    expect(computeListChanges(set('a'), set('a'), set('a', 'manual'), false)).toEqual({ add: [], remove: [] });
  });

  it('only adds for a static segment', () => {
    expect(computeListChanges(set('a', 'b'), set('a', 'c'), set('c'), true)).toEqual({ add: ['a', 'b'], remove: [] });
  });
});
