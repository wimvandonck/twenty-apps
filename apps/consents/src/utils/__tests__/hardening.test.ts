import { describe, expect, it } from 'vitest';

import { createMemoryRecordStore } from 'src/twenty-client/__tests__/memory-record-store';
import { findMissingTargets } from 'src/utils/find-missing-targets.util';
import { htmlResponse } from 'src/utils/html-response.util';
import { parseChangeRequest } from 'src/utils/parse-change-request.util';
import { readAppConfigOrNull } from 'src/utils/read-app-config.util';

const NOW = Date.parse('2027-01-01T10:00:00.000Z');

describe('public page headers', () => {
  it('keep the token out of referrers and the pages out of frames', () => {
    const headers = (htmlResponse(200, '<p>x</p>') as unknown as { headers: Record<string, string> }).headers;

    expect(headers['referrer-policy']).toBe('no-referrer');
    expect(headers['content-security-policy']).toBe("frame-ancestors 'none'");
    expect(headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('occurredAt', () => {
  const request = (occurredAt: string) => ({
    personId: 'ann',
    changes: [{ emailTypeId: 'news', action: 'GRANTED', source: 'IMPORT', occurredAt }],
  });

  it('accepts a past date and normalizes it', () => {
    expect(parseChangeRequest(request('2026-05-01T08:00:00+02:00'), NOW)).toMatchObject({
      ok: true,
      value: { changes: [{ occurredAt: '2026-05-01T06:00:00.000Z' }] },
    });
  });

  it('refuses something that is not a date, or lies in the future', () => {
    expect(parseChangeRequest(request('yesterday'), NOW).ok).toBe(false);
    expect(parseChangeRequest(request('2027-01-02T00:00:00.000Z'), NOW).ok).toBe(false);
  });
});

describe('findMissingTargets', () => {
  it('names an unknown person and unknown email types', async () => {
    const { store } = createMemoryRecordStore({ people: [{ id: 'ann' }], emailTypes: [{ id: 'news' }] });

    expect(await findMissingTargets(store, { personId: 'ann', changes: [{ emailTypeId: 'news', action: 'GRANTED', source: 'API' }] })).toEqual([]);
    expect(
      await findMissingTargets(store, { personId: 'bob', changes: [{ emailTypeId: 'gone', action: 'GRANTED', source: 'API' }] }),
    ).toEqual(['personId bob does not exist', 'emailTypeId gone does not exist']);
  });
});

describe('readAppConfigOrNull', () => {
  it('gives null instead of throwing when the signing secret is missing', () => {
    expect(readAppConfigOrNull({ TWENTY_API_URL: 'https://x' })).toBeNull();
    expect(readAppConfigOrNull({ CONSENT_SIGNING_SECRET: 's' })?.signingSecret).toBe('s');
  });
});
