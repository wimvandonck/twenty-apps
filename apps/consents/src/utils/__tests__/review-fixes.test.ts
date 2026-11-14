import { describe, expect, it } from 'vitest';

import { createMemoryRecordStore } from 'src/twenty-client/__tests__/memory-record-store';
import { fetchChanges } from 'src/twenty-client/fetch-changes';
import { fetchPendingConsents } from 'src/twenty-client/fetch-pending-consents';
import { findOrCreateConsent } from 'src/twenty-client/find-or-create-consent';
import { type AppConfig } from 'src/types/app-config';
import { type RecordStore } from 'src/types/record-store';
import { deriveStatus } from 'src/utils/derive-status.util';
import { getPublicMessages } from 'src/utils/get-public-messages.util';
import { handleStatusEdit } from 'src/utils/handle-status-edit.util';
import { renderConfirmPromptHtml } from 'src/utils/render-confirm-prompt-html.util';

const NOW = Date.parse('2027-01-01T10:00:00.000Z');
const config: AppConfig = {
  signingSecret: 'secret',
  brevoApiKey: null,
  senderEmail: '',
  senderName: '',
  organizationName: 'Vzw',
  publicBaseUrl: 'https://crm.test',
};

describe('handleStatusEdit with the edit from the event (review #1, #2)', () => {
  it('ignores a stale edit that happened before the latest change', async () => {
    const { store, tables } = createMemoryRecordStore({
      consents: [{ id: 'c1', personId: 'ann', emailTypeId: 'news', status: 'GRANTED' }],
      consentChanges: [
        { id: 'ch1', consentId: 'c1', action: 'GRANTED', occurredAt: '2027-01-01T09:00:00.000Z', createdAt: '2027-01-01T09:00:00.000Z' },
        { id: 'ch2', consentId: 'c1', action: 'WITHDRAWN', occurredAt: '2027-01-01T09:59:00.000Z', createdAt: '2027-01-01T09:59:00.000Z' },
      ],
    });

    await handleStatusEdit(store, config, 'c1', NOW, { status: 'GRANTED', updatedAt: '2027-01-01T09:00:01.000Z' });

    expect(tables.consentChanges).toHaveLength(2);
  });

  it('ignores an edit the record no longer shows', async () => {
    const { store, tables } = createMemoryRecordStore({
      consents: [{ id: 'c1', personId: 'ann', emailTypeId: 'news', status: 'WITHDRAWN' }],
      consentChanges: [
        { id: 'ch1', consentId: 'c1', action: 'GRANTED', occurredAt: '2027-01-01T09:00:00.000Z', createdAt: '2027-01-01T09:00:00.000Z' },
      ],
    });

    await handleStatusEdit(store, config, 'c1', NOW, { status: 'GRANTED', updatedAt: '2027-01-01T09:30:00.000Z' });

    expect(tables.consentChanges).toHaveLength(1);
  });

  it('logs a consent created with a status as a manual change', async () => {
    const { store, tables } = createMemoryRecordStore({
      consents: [{ id: 'c1', personId: 'ann', emailTypeId: 'news', status: 'GRANTED' }],
    });

    await handleStatusEdit(store, config, 'c1', NOW, { status: 'GRANTED', updatedAt: '2027-01-01T09:30:00.000Z' });

    expect(tables.consentChanges).toEqual([expect.objectContaining({ action: 'GRANTED', source: 'MANUAL' })]);
  });
});

describe('fetchPendingConsents order (review #3)', () => {
  it('reads the newest pending consents first', async () => {
    const { store } = createMemoryRecordStore({
      consents: [
        { id: 'old', status: 'PENDING', createdAt: '2026-01-01T00:00:00.000Z' },
        { id: 'new', status: 'PENDING', createdAt: '2027-01-01T00:00:00.000Z' },
      ],
    });

    expect((await fetchPendingConsents(store)).map((consent) => consent.id)).toEqual(['new', 'old']);
  });
});

describe('fetchChanges on a long history (review #4)', () => {
  it('derives from the newest changes, so a late withdrawal counts', async () => {
    const changes = Array.from({ length: 250 }, (_, index) => ({
      id: `ch${index}`,
      consentId: 'c1',
      action: index === 249 ? 'WITHDRAWN' : index % 2 === 0 ? 'GRANTED' : 'REQUESTED',
      occurredAt: new Date(NOW - (250 - index) * 60_000).toISOString(),
    }));
    const { store } = createMemoryRecordStore({ consentChanges: changes });

    expect(deriveStatus((await fetchChanges(store, 'c1')).map((change) => change.action))).toBe('WITHDRAWN');
  });
});

describe('findOrCreateConsent under concurrency (review #5)', () => {
  it('keeps the oldest consent when two requests create one at the same time', async () => {
    const { store, tables } = createMemoryRecordStore({
      consents: [{ id: 'first', personId: 'ann', emailTypeId: 'news', status: null, createdAt: '2027-01-01T00:00:00.000Z' }],
    });
    let calls = 0;
    // The first look misses the record the other request just created.
    const staleStore: RecordStore = {
      ...store,
      find: async (name, where, options) => {
        calls += 1;

        return name === 'consents' && calls === 1 ? [] : store.find(name, where, options);
      },
    };

    const consent = await findOrCreateConsent(staleStore, 'ann', 'news');

    expect(consent.id).toBe('first');
    expect(tables.consents.map((record) => record.id)).toEqual(['first']);
  });
});

describe('confirmation prompt (review #6)', () => {
  it('asks for a click that posts the token instead of confirming on open', () => {
    const { messages } = getPublicMessages('nl', undefined);
    const html = renderConfirmPromptHtml(messages, 'nl', 'tok"en');

    expect(html).toMatch(/<form method="post"/);
    expect(html).toContain('value="tok&quot;en"');
    expect(html).toContain('Inschrijving bevestigen');
  });
});
