import { describe, expect, it } from 'vitest';

import { createMemoryRecordStore } from 'src/twenty-client/__tests__/memory-record-store';
import { createConsentChange } from 'src/twenty-client/create-consent-change';
import { fetchLatestChange } from 'src/twenty-client/fetch-latest-change';
import { fetchPendingConsents } from 'src/twenty-client/fetch-pending-consents';
import { fetchPreferenceData } from 'src/twenty-client/fetch-preference-data';
import { findOrCreateConsent } from 'src/twenty-client/find-or-create-consent';
import { setListMembership } from 'src/twenty-client/set-list-membership';

const seed = () =>
  createMemoryRecordStore({
    people: [
      { id: 'ann', name: { firstName: 'Ann', lastName: 'Peeters' }, emails: { primaryEmail: 'ann@example.org' } },
    ],
    emailTypes: [
      { id: 'news', name: 'Nieuwsbrief', description: 'Elke maand', isActive: true },
      { id: 'old', name: 'Oud', description: '', isActive: false },
    ],
    messageLists: [
      { id: 'climate', name: 'Klimaat', showOnPreferencePage: true, requiredEmailTypeId: 'news' },
      { id: 'agm', name: 'Algemene vergadering', showOnPreferencePage: false, requiredEmailTypeId: null },
      { id: 'events', name: 'Evenementen', showOnPreferencePage: true, requiredEmailTypeId: null },
    ],
    messageListMembers: [{ id: 'm1', listId: 'events', personId: 'ann' }],
  });

describe('findOrCreateConsent', () => {
  it('creates a consent once and reuses it', async () => {
    const { store, tables } = seed();

    const first = await findOrCreateConsent(store, 'ann', 'news');
    const second = await findOrCreateConsent(store, 'ann', 'news');

    expect(first.id).toBe(second.id);
    expect(first.status).toBeNull();
    expect(tables.consents).toHaveLength(1);
    expect(tables.consents[0].name).toBe('Ann Peeters – Nieuwsbrief');
  });
});

describe('createConsentChange and fetchLatestChange', () => {
  it('returns the most recent change', async () => {
    const { store } = seed();
    const consent = await findOrCreateConsent(store, 'ann', 'news');

    await createConsentChange(store, consent.id, { action: 'REQUESTED', source: 'FORM', occurredAt: '2027-01-01T10:00:00.000Z' });
    await createConsentChange(store, consent.id, { action: 'CONFIRMED', source: 'FORM', occurredAt: '2027-01-01T10:05:00.000Z' });

    expect(await fetchLatestChange(store, consent.id)).toMatchObject({ action: 'CONFIRMED' });
    expect(await fetchLatestChange(store, 'none')).toBeNull();
  });

  it('names the change after its action and time', async () => {
    const { store, tables } = seed();
    const consent = await findOrCreateConsent(store, 'ann', 'news');

    await createConsentChange(store, consent.id, { action: 'WITHDRAWN', source: 'MANUAL', occurredAt: '2027-01-01T10:00:00.000Z' });

    expect(tables.consentChanges[0]).toMatchObject({ name: 'WITHDRAWN 2027-01-01 10:00', consentId: consent.id });
  });
});

describe('fetchPendingConsents', () => {
  it('lists pending consents without a sent confirmation, with the request details', async () => {
    const { store } = seed();
    const consent = await findOrCreateConsent(store, 'ann', 'news');

    await store.update('consents', consent.id, { status: 'PENDING', confirmationUrl: 'https://x/confirm' });
    await createConsentChange(store, consent.id, {
      action: 'REQUESTED',
      source: 'FORM',
      submissionId: 'sub-1',
      language: 'nl',
      occurredAt: '2027-01-01T10:00:00.000Z',
    });

    expect(await fetchPendingConsents(store)).toEqual([
      expect.objectContaining({
        id: consent.id,
        submissionId: 'sub-1',
        language: 'nl',
        email: 'ann@example.org',
        firstName: 'Ann',
        emailTypeName: 'Nieuwsbrief',
      }),
    ]);

    await store.update('consents', consent.id, { confirmationSentAt: '2027-01-01T10:01:00.000Z' });

    expect(await fetchPendingConsents(store)).toEqual([]);
  });
});

describe('setListMembership', () => {
  it('adds a member once and removes only that member', async () => {
    const { store, tables } = seed();

    await setListMembership(store, 'climate', 'ann', true);
    await setListMembership(store, 'climate', 'ann', true);

    expect(tables.messageListMembers.filter((member) => member.listId === 'climate')).toHaveLength(1);

    await setListMembership(store, 'climate', 'ann', false);

    expect(tables.messageListMembers).toEqual([expect.objectContaining({ id: 'm1', listId: 'events' })]);
  });
});

describe('fetchPreferenceData', () => {
  it('returns active email types with status and the visible lists with membership', async () => {
    const { store } = seed();
    const consent = await findOrCreateConsent(store, 'ann', 'news');

    await store.update('consents', consent.id, { status: 'GRANTED' });

    expect(await fetchPreferenceData(store, 'ann')).toEqual({
      firstName: 'Ann',
      emailTypes: [{ id: 'news', name: 'Nieuwsbrief', description: 'Elke maand', status: 'GRANTED' }],
      lists: [
        { id: 'events', name: 'Evenementen', requiredEmailTypeId: null, isMember: true },
        { id: 'climate', name: 'Klimaat', requiredEmailTypeId: 'news', isMember: false },
      ],
    });
  });

  it('returns null for an unknown person', async () => {
    const { store } = seed();

    expect(await fetchPreferenceData(store, 'nobody')).toBeNull();
  });
});
