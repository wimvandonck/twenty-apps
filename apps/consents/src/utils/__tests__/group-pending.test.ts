import { describe, expect, it } from 'vitest';

import { type PendingConsent } from 'src/types/pending-consent';
import { groupPendingForRetry } from 'src/utils/group-pending-for-retry.util';

const NOW = Date.parse('2027-02-01T00:00:00.000Z');

const pending = (overrides: Partial<PendingConsent>): PendingConsent => ({
  id: 'c',
  name: '',
  personId: 'ann',
  emailTypeId: 'news',
  status: 'PENDING',
  grantedAt: null,
  withdrawnAt: null,
  confirmationUrl: 'https://x',
  confirmationSentAt: null,
  submissionId: 'sub-1',
  language: 'nl',
  requestedAt: '2027-01-31T00:00:00.000Z',
  email: 'ann@example.org',
  firstName: 'Ann',
  emailTypeName: 'Nieuwsbrief',
  ...overrides,
});

describe('groupPendingForRetry', () => {
  it('groups by submission, once per submission', () => {
    expect(
      groupPendingForRetry(
        [pending({ id: 'c1' }), pending({ id: 'c2' }), pending({ id: 'c3', submissionId: 'sub-2', language: 'fr' })],
        NOW,
      ),
    ).toEqual([
      { personId: 'ann', submissionId: 'sub-1', locale: 'nl' },
      { personId: 'ann', submissionId: 'sub-2', locale: 'fr' },
    ]);
  });

  it('skips requests older than the link validity, without a submission or without an email', () => {
    expect(
      groupPendingForRetry(
        [
          pending({ requestedAt: '2026-12-01T00:00:00.000Z' }),
          pending({ submissionId: null }),
          pending({ email: null }),
        ],
        NOW,
      ),
    ).toEqual([]);
  });
});
