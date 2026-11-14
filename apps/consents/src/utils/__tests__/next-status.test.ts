import { describe, expect, it } from 'vitest';

import { nextStatus } from 'src/utils/next-status.util';

describe('nextStatus', () => {
  it('puts a new request on pending', () => {
    expect(nextStatus(null, 'REQUESTED')).toBe('PENDING');
  });

  it('keeps a granted consent when the person requests again', () => {
    expect(nextStatus('GRANTED', 'REQUESTED')).toBe('GRANTED');
  });

  it('puts a withdrawn consent back on pending when requested again', () => {
    expect(nextStatus('WITHDRAWN', 'REQUESTED')).toBe('PENDING');
  });

  it('grants on confirmation', () => {
    expect(nextStatus('PENDING', 'CONFIRMED')).toBe('GRANTED');
  });

  it('grants and withdraws from any status', () => {
    for (const current of [null, 'PENDING', 'GRANTED', 'WITHDRAWN'] as const) {
      expect(nextStatus(current, 'GRANTED')).toBe('GRANTED');
      expect(nextStatus(current, 'WITHDRAWN')).toBe('WITHDRAWN');
    }
  });
});
