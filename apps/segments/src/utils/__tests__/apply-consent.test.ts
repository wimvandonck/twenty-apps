import { describe, expect, it } from 'vitest';

import { applyConsent } from 'src/utils/apply-consent.util';

describe('applyConsent', () => {
  it('adds everyone when the list requires no consent', () => {
    expect(applyConsent(['a', 'b'], null)).toEqual({ add: ['a', 'b'], skipped: [] });
  });

  it('skips people without the required consent', () => {
    expect(applyConsent(['a', 'b', 'c'], new Set(['b']))).toEqual({ add: ['b'], skipped: ['a', 'c'] });
  });
});
