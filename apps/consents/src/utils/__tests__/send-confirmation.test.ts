import { afterEach, describe, expect, it, vi } from 'vitest';

import { createMemoryRecordStore } from 'src/twenty-client/__tests__/memory-record-store';
import { type AppConfig } from 'src/types/app-config';
import { buildConfirmationUrl } from 'src/utils/build-confirmation-url.util';
import { buildPreferencesUrl } from 'src/utils/build-preferences-url.util';
import { sendConfirmation } from 'src/utils/send-confirmation.util';
import { verifyToken } from 'src/utils/verify-token.util';

const NOW = 1_800_000_000_000;
const config: AppConfig = {
  signingSecret: 'secret',
  brevoApiKey: 'key',
  senderEmail: 'info@example.org',
  senderName: 'Vzw',
  organizationName: 'Vzw Groen',
  publicBaseUrl: 'https://crm.test',
};

const seed = (status = 'PENDING') =>
  createMemoryRecordStore({
    people: [{ id: 'ann', name: { firstName: 'Ann', lastName: 'P' }, emails: { primaryEmail: 'ann@example.org' } }],
    emailTypes: [
      { id: 'news', name: 'Nieuwsbrief' },
      { id: 'events', name: 'Uitnodigingen' },
    ],
    consents: [
      { id: 'c1', personId: 'ann', emailTypeId: 'news', status },
      { id: 'c2', personId: 'ann', emailTypeId: 'events', status: 'PENDING' },
    ],
    consentChanges: [
      { id: 'ch1', consentId: 'c1', action: 'REQUESTED', submissionId: 'sub-1' },
      { id: 'ch2', consentId: 'c2', action: 'REQUESTED', submissionId: 'sub-1' },
    ],
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('links', () => {
  it('builds a confirmation link valid for 30 days', () => {
    const url = new URL(buildConfirmationUrl(config.publicBaseUrl, 'sub-1', 'secret', NOW));

    expect(url.origin + url.pathname).toBe('https://crm.test/s/consents/confirm');
    expect(verifyToken(url.searchParams.get('token') ?? '', 'secret', NOW + 29 * 86_400_000)).toEqual({
      kind: 'confirm',
      submissionId: 'sub-1',
      expiresAt: NOW + 30 * 86_400_000,
    });
    expect(verifyToken(url.searchParams.get('token') ?? '', 'secret', NOW + 31 * 86_400_000)).toBeNull();
  });

  it('builds a preferences link that never expires', () => {
    const url = new URL(buildPreferencesUrl('https://crm.test', 'ann', 'secret'));

    expect(url.pathname).toBe('/s/consents/preferences');
    expect(verifyToken(url.searchParams.get('token') ?? '', 'secret', Number.MAX_SAFE_INTEGER)).toEqual({
      kind: 'preferences',
      personId: 'ann',
    });
  });
});

describe('sendConfirmation', () => {
  it('sends one mail for every pending consent of the submission and marks them sent', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 201 }));

    vi.stubGlobal('fetch', fetchMock);
    const { store, tables } = seed();

    expect(await sendConfirmation(store, config, { personId: 'ann', submissionId: 'sub-1', locale: 'nl' }, NOW)).toEqual({
      sent: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const body = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);

    expect(body.to).toEqual([{ email: 'ann@example.org', name: 'Ann P' }]);
    expect(body.textContent).toContain('Nieuwsbrief');
    expect(body.textContent).toContain('Uitnodigingen');
    expect(tables.consents.map((consent) => consent.confirmationSentAt)).toEqual([
      new Date(NOW).toISOString(),
      new Date(NOW).toISOString(),
    ]);
  });

  it('leaves out consents that are no longer pending', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 201 }));

    vi.stubGlobal('fetch', fetchMock);
    const { store } = seed('GRANTED');

    await sendConfirmation(store, config, { personId: 'ann', submissionId: 'sub-1', locale: 'nl' }, NOW);

    const body = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);

    expect(body.textContent).not.toContain('Nieuwsbrief');
  });

  it('sends nothing without a Brevo key and keeps the consents unsent', async () => {
    const fetchMock = vi.fn();

    vi.stubGlobal('fetch', fetchMock);
    const { store, tables } = seed();

    expect(
      await sendConfirmation(store, { ...config, brevoApiKey: null }, { personId: 'ann', submissionId: 'sub-1', locale: 'nl' }, NOW),
    ).toEqual({ sent: false, retry: false, reason: 'no-sender' });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(tables.consents.every((consent) => !consent.confirmationSentAt)).toBe(true);
  });

  it('keeps the consents unsent when Brevo asks to retry', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 429 })));
    const { store, tables } = seed();

    expect(await sendConfirmation(store, config, { personId: 'ann', submissionId: 'sub-1', locale: 'nl' }, NOW)).toMatchObject({
      sent: false,
      retry: true,
    });
    expect(tables.consents.every((consent) => !consent.confirmationSentAt)).toBe(true);
  });
});
