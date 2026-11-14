import { describe, expect, it } from 'vitest';

import { parseDefinition } from 'src/utils/parse-definition.util';
import { resolveRelativeDate } from 'src/utils/resolve-relative-dates.util';

describe('parseDefinition', () => {
  it('accepts a valid definition, also as text', () => {
    const definition = { match: 'ALL', conditions: [{ type: 'related', object: 'donations', relation: 'donor' }] };

    expect(parseDefinition(definition)).toEqual(definition);
    expect(parseDefinition(JSON.stringify(definition))).toEqual(definition);
  });

  it('explains what is missing', () => {
    expect(() => parseDefinition(null)).toThrow('Add a definition');
    expect(() => parseDefinition({ match: 'ALL', conditions: [] })).toThrow('at least one condition');
    expect(() => parseDefinition({ match: 'ALL', conditions: [{ type: 'related', object: 'donations' }] })).toThrow(
      'Condition 1',
    );
    expect(() =>
      parseDefinition({ match: 'ALL', conditions: [{ type: 'related', object: 'd', relation: 'p', operator: 'MORE' }] }),
    ).toThrow('unknown operator');
  });
});

describe('resolveRelativeDate', () => {
  const now = new Date('2026-11-14T12:30:00Z');

  it('handles days, weeks, months and years', () => {
    expect(resolveRelativeDate('@today', now)).toBe('2026-11-14');
    expect(resolveRelativeDate('@today-7d', now)).toBe('2026-11-07');
    expect(resolveRelativeDate('@today-2w', now)).toBe('2026-10-31');
    expect(resolveRelativeDate('@today-12M', now)).toBe('2025-11-14');
    expect(resolveRelativeDate('@now+1y', now)).toBe('2027-11-14T12:30:00.000Z');
  });

  it('leaves other text alone', () => {
    expect(resolveRelativeDate('Brussel', now)).toBe('Brussel');
    expect(resolveRelativeDate('@tomorrow', now)).toBe('@tomorrow');
  });
});
