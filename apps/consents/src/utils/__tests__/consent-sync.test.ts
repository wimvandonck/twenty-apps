import { describe, expect, it } from 'vitest';

import { createMemoryRecordStore } from 'src/twenty-client/__tests__/memory-record-store';
import { type AppConfig } from 'src/types/app-config';
import { type ConsentRecord } from 'src/types/consent-record';
import { applyStatus } from 'src/utils/apply-status.util';
import { deriveStatus } from 'src/utils/derive-status.util';
import { handleStatusEdit } from 'src/utils/handle-status-edit.util';
import { parseChangeRequest } from 'src/utils/parse-change-request.util';
import { reconcileConsent } from 'src/utils/reconcile-consent.util';
import { recordChanges } from 'src/utils/record-changes.util';

const NOW = Date.parse('2027-01-01T10:00:00.000Z');
const config: AppConfig = {
  signingSecret: 'secret',
  brevoApiKey: null,
  senderEmail: '',
  senderName: '',
  organizationName: 'Vzw',
  publicBaseUrl: 'https://crm.test',
};

const consent = (overrides: Partial<ConsentRecord> = {}): ConsentRecord => ({
  id: 'c1',
  name: '',
  personId: 'ann',
  emailTypeId: 'news',
  status: null,
  grantedAt: null,
  withdrawnAt: null,
  confirmationUrl: null,
  confirmationSentAt: null,
  ...overrides,
});

const seed = () =>
  createMemoryRecordStore({
    people: [{ id: 'ann', name: { firstName: 'Ann', lastName: 'P' }, emails: { primaryEmail: 'ann@example.org' } }],
    emailTypes: [
      { id: 'news', name: 'Nieuwsbrief' },
      { id: 'events', name: 'Uitnodigingen' },
    ],
  });

describe('deriveStatus', () => {
  it('replays the history', () => {
    expect(deriveStatus([])).toBeNull();
    expect(deriveStatus(['REQUESTED'])).toBe('PENDING');
    expect(deriveStatus(['REQUESTED', 'CONFIRMED', 'REQUESTED'])).toBe('GRANTED');
    expect(deriveStatus(['GRANTED', 'WITHDRAWN', 'REQUESTED'])).toBe('PENDING');
  });
});

describe('applyStatus', () => {
  const now = '2027-01-01T10:00:00.000Z';

  it('stamps the grant and clears the confirmation link', () => {
    expect(applyStatus(consent({ status: 'PENDING', confirmationUrl: 'u' }), 'GRANTED', now, null)).toEqual({
      status: 'GRANTED',
      grantedAt: now,
      confirmationUrl: null,
    });
  });

  it('stamps a withdrawal', () => {
    expect(applyStatus(consent({ status: 'GRANTED' }), 'WITHDRAWN', now, null)).toEqual({
      status: 'WITHDRAWN',
      withdrawnAt: now,
    });
  });

  it('sets a new confirmation link and resets the sent time on a fresh request', () => {
    expect(applyStatus(consent({ status: 'WITHDRAWN', confirmationSentAt: 'old' }), 'PENDING', now, 'u2')).toEqual({
      status: 'PENDING',
      confirmationUrl: 'u2',
      confirmationSentAt: null,
    });
  });

  it('changes nothing when the status and link stay', () => {
    expect(applyStatus(consent({ status: 'GRANTED' }), 'GRANTED', now, null)).toEqual({});
  });
});

describe('parseChangeRequest', () => {
  it('accepts a valid request', () => {
    expect(
      parseChangeRequest({ personId: 'ann', changes: [{ emailTypeId: 'news', action: 'REQUESTED', source: 'FORM', shownText: 'Ja' }] }),
    ).toEqual({
      ok: true,
      value: { personId: 'ann', changes: [{ emailTypeId: 'news', action: 'REQUESTED', source: 'FORM', shownText: 'Ja' }] },
    });
  });

  it('rejects missing or unknown values', () => {
    expect(parseChangeRequest({ changes: [{ emailTypeId: 'news', action: 'GRANTED', source: 'API' }] }).ok).toBe(false);
    expect(parseChangeRequest({ personId: 'ann', changes: [] }).ok).toBe(false);
    expect(parseChangeRequest({ personId: 'ann', changes: [{ emailTypeId: 'news', action: 'MAYBE', source: 'API' }] }).ok).toBe(false);
    expect(parseChangeRequest({ personId: 'ann', changes: [{ emailTypeId: 'news', action: 'GRANTED', source: 'WEB' }] }).ok).toBe(false);
    expect(parseChangeRequest({ personId: 'ann', changes: [{ action: 'GRANTED', source: 'API' }] }).ok).toBe(false);
    expect(parseChangeRequest(null).ok).toBe(false);
  });
});

describe('recordChanges', () => {
  it('records a request as pending with one shared submission and a confirmation link', async () => {
    const { store, tables } = seed();

    const result = await recordChanges(
      store,
      config,
      {
        personId: 'ann',
        changes: [
          { emailTypeId: 'news', action: 'REQUESTED', source: 'FORM' },
          { emailTypeId: 'events', action: 'REQUESTED', source: 'FORM' },
        ],
      },
      { ipAddress: '1.2.3.4', userAgent: 'UA' },
      NOW,
    );

    expect(result.consents).toEqual([
      { emailTypeId: 'news', status: 'PENDING' },
      { emailTypeId: 'events', status: 'PENDING' },
    ]);
    expect(new Set(tables.consentChanges.map((change) => change.submissionId)).size).toBe(1);
    expect(tables.consentChanges[0]).toMatchObject({ ipAddress: '1.2.3.4', userAgent: 'UA' });
    expect(String(tables.consents[0].confirmationUrl)).toContain('https://crm.test/s/consents/confirm?token=');
    expect(result.confirmation).toEqual({ sent: false, retry: false, reason: 'no-sender' });
  });

  it('keeps a granted consent and sends nothing on a new request', async () => {
    const { store, tables } = seed();

    await recordChanges(store, config, { personId: 'ann', changes: [{ emailTypeId: 'news', action: 'GRANTED', source: 'MANUAL' }] }, {}, NOW);
    const result = await recordChanges(
      store,
      config,
      { personId: 'ann', changes: [{ emailTypeId: 'news', action: 'REQUESTED', source: 'FORM' }] },
      {},
      NOW + 1000,
    );

    expect(result.consents).toEqual([{ emailTypeId: 'news', status: 'GRANTED' }]);
    expect(result.confirmation).toBeNull();
    expect(tables.consents[0].status).toBe('GRANTED');
    expect(tables.consents[0].confirmationUrl ?? null).toBeNull();
  });

  it('withdraws with a timestamp', async () => {
    const { store, tables } = seed();

    await recordChanges(store, config, { personId: 'ann', changes: [{ emailTypeId: 'news', action: 'WITHDRAWN', source: 'API' }] }, {}, NOW);

    expect(tables.consents[0]).toMatchObject({ status: 'WITHDRAWN', withdrawnAt: new Date(NOW).toISOString() });
  });
});

describe('reconcileConsent', () => {
  it('brings the status in line with a change created elsewhere', async () => {
    const { store, tables } = seed();

    tables.consents = [{ id: 'c1', personId: 'ann', emailTypeId: 'news', status: null }];
    tables.consentChanges = [{ id: 'ch1', consentId: 'c1', action: 'REQUESTED', occurredAt: '2027-01-01T09:00:00.000Z' }];

    await reconcileConsent(store, config, 'c1', NOW);

    expect(tables.consents[0].status).toBe('PENDING');
    expect(String(tables.consents[0].confirmationUrl)).toContain('/s/consents/confirm?token=');
  });

  it('writes nothing when the status already matches', async () => {
    const { store, tables } = seed();

    tables.consents = [{ id: 'c1', personId: 'ann', emailTypeId: 'news', status: 'GRANTED', grantedAt: 'x', confirmationUrl: null }];
    tables.consentChanges = [{ id: 'ch1', consentId: 'c1', action: 'GRANTED', occurredAt: '2027-01-01T09:00:00.000Z' }];

    expect(await reconcileConsent(store, config, 'c1', NOW)).toBe(false);
  });
});

describe('handleStatusEdit', () => {
  it('logs a manual change when someone sets the status by hand', async () => {
    const { store, tables } = seed();

    tables.consents = [{ id: 'c1', personId: 'ann', emailTypeId: 'news', status: 'WITHDRAWN' }];
    tables.consentChanges = [{ id: 'ch1', consentId: 'c1', action: 'GRANTED', occurredAt: '2027-01-01T09:00:00.000Z' }];

    await handleStatusEdit(store, config, 'c1', NOW);

    expect(tables.consentChanges[1]).toMatchObject({ action: 'WITHDRAWN', source: 'MANUAL' });
  });

  it('ignores the app’s own updates', async () => {
    const { store, tables } = seed();

    tables.consents = [{ id: 'c1', personId: 'ann', emailTypeId: 'news', status: 'GRANTED' }];
    tables.consentChanges = [{ id: 'ch1', consentId: 'c1', action: 'GRANTED', occurredAt: '2027-01-01T09:00:00.000Z' }];

    await handleStatusEdit(store, config, 'c1', NOW);

    expect(tables.consentChanges).toHaveLength(1);
  });

  it('puts back the status when someone sets pending by hand', async () => {
    const { store, tables } = seed();

    tables.consents = [{ id: 'c1', personId: 'ann', emailTypeId: 'news', status: 'PENDING' }];
    tables.consentChanges = [{ id: 'ch1', consentId: 'c1', action: 'GRANTED', occurredAt: '2027-01-01T09:00:00.000Z' }];

    await handleStatusEdit(store, config, 'c1', NOW);

    expect(tables.consents[0].status).toBe('GRANTED');
    expect(tables.consentChanges).toHaveLength(1);
  });
});
