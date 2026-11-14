import { describe, expect, it } from 'vitest';

import { buildRestFilter } from 'src/utils/build-rest-filter.util';

describe('buildRestFilter', () => {
  it('joins equality, boolean and empty conditions', () => {
    expect(buildRestFilter({ personId: 'p-1', isActive: true, confirmationSentAt: null })).toBe(
      'personId[eq]:"p-1",isActive[eq]:true,confirmationSentAt[is]:NULL',
    );
  });

  it('escapes quotes in values', () => {
    expect(buildRestFilter({ name: 'a"b' })).toBe('name[eq]:"a\\"b"');
  });

  it('gives undefined without conditions', () => {
    expect(buildRestFilter({})).toBeUndefined();
  });
});
