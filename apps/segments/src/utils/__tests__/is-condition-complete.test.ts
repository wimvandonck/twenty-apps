import { describe, expect, it } from 'vitest';

import { isConditionComplete } from 'src/utils/is-condition-complete.util';

describe('isConditionComplete', () => {
  it('needs an object, a relation and a value for linked records', () => {
    expect(isConditionComplete({ type: 'related', object: 'donations', relation: 'donor', value: 1 })).toBe(true);
    expect(isConditionComplete({ type: 'related', object: 'donations', relation: 'donor', value: '' })).toBe(false);
    expect(
      isConditionComplete({
        type: 'related',
        object: 'donations',
        relation: 'donor',
        measure: { aggregate: 'SUM', field: '' },
        value: 50,
      }),
    ).toBe(false);
  });

  it('needs a field and, unless testing for empty, a value for own fields', () => {
    expect(isConditionComplete({ type: 'property', filter: {}, field: '', operator: 'IS', value: '' })).toBe(false);
    expect(isConditionComplete({ type: 'property', filter: {}, field: 'jobTitle', operator: 'IS_EMPTY', value: '' })).toBe(true);
    expect(isConditionComplete({ type: 'property', filter: { city: { eq: 'Gent' } } })).toBe(true);
  });

  it('needs a list, and groups need complete conditions', () => {
    expect(isConditionComplete({ type: 'list', listId: '' })).toBe(false);
    expect(isConditionComplete({ type: 'group', match: 'ANY', conditions: [] })).toBe(false);
    expect(isConditionComplete({ type: 'group', match: 'ANY', conditions: [{ type: 'list', listId: 'x' }] })).toBe(true);
  });
});
