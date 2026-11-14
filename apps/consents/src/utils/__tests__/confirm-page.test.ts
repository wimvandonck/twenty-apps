import { describe, expect, it } from 'vitest';

import { createMemoryRecordStore } from 'src/twenty-client/__tests__/memory-record-store';
import { type AppConfig } from 'src/types/app-config';
import { confirmSubmission } from 'src/utils/confirm-submission.util';
import { getPublicMessages } from 'src/utils/get-public-messages.util';
import { renderConfirmedHtml } from 'src/utils/render-confirmed-html.util';
import { renderInvalidLinkHtml } from 'src/utils/render-invalid-link-html.util';
import { signToken } from 'src/utils/sign-token.util';

const NOW = 1_800_000_000_000;
const config: AppConfig = {
  signingSecret: 'secret',
  brevoApiKey: null,
  senderEmail: '',
  senderName: '',
  organizationName: 'Vzw',
  publicBaseUrl: 'https://crm.test',
};
const confirmToken = signToken({ kind: 'confirm', submissionId: 'sub-1', expiresAt: NOW + 1000 }, 'secret');

const seed = () =>
  createMemoryRecordStore({
    people: [{ id: 'ann', name: { firstName: 'Ann' } }],
    emailTypes: [
      { id: 'news', name: 'Nieuwsbrief' },
      { id: 'events', name: 'Uitnodigingen' },
    ],
    consents: [
      { id: 'c1', personId: 'ann', emailTypeId: 'news', status: 'PENDING', confirmationUrl: 'u' },
      { id: 'c2', personId: 'ann', emailTypeId: 'events', status: 'PENDING', confirmationUrl: 'u' },
    ],
    consentChanges: [
      { id: 'ch1', consentId: 'c1', action: 'REQUESTED', submissionId: 'sub-1', occurredAt: '2027-01-01T09:00:00.000Z' },
      { id: 'ch2', consentId: 'c2', action: 'REQUESTED', submissionId: 'sub-1', occurredAt: '2027-01-01T09:00:00.000Z' },
    ],
  });

describe('confirmSubmission', () => {
  it('confirms every pending consent of the submission once', async () => {
    const { store, tables } = seed();

    const first = await confirmSubmission(store, config, confirmToken, { ipAddress: '1.2.3.4' }, NOW);

    expect(first).toMatchObject({ ok: true, personId: 'ann', emailTypeNames: ['Nieuwsbrief', 'Uitnodigingen'] });
    expect(tables.consentChanges.filter((change) => change.action === 'CONFIRMED')).toEqual([
      expect.objectContaining({ consentId: 'c1', ipAddress: '1.2.3.4', source: 'FORM' }),
      expect.objectContaining({ consentId: 'c2', ipAddress: '1.2.3.4', source: 'FORM' }),
    ]);
    expect(tables.consents.map((consent) => consent.status)).toEqual(['GRANTED', 'GRANTED']);

    const second = await confirmSubmission(store, config, confirmToken, {}, NOW);

    expect(second).toMatchObject({ ok: true, emailTypeNames: ['Nieuwsbrief', 'Uitnodigingen'] });
    expect(tables.consentChanges.filter((change) => change.action === 'CONFIRMED')).toHaveLength(2);
  });

  it('does not confirm a consent withdrawn since the request', async () => {
    const { store, tables } = seed();

    tables.consents[1].status = 'WITHDRAWN';

    const result = await confirmSubmission(store, config, confirmToken, {}, NOW);

    expect(result).toMatchObject({ ok: true, emailTypeNames: ['Nieuwsbrief'] });
    expect(tables.consents[1].status).toBe('WITHDRAWN');
  });

  it('rejects preference tokens, other secrets and expired tokens', async () => {
    const { store, tables } = seed();

    for (const token of [
      signToken({ kind: 'preferences', personId: 'ann' }, 'secret'),
      signToken({ kind: 'confirm', submissionId: 'sub-1', expiresAt: NOW + 1000 }, 'other'),
      signToken({ kind: 'confirm', submissionId: 'sub-1', expiresAt: NOW - 1 }, 'secret'),
      'nonsense',
    ]) {
      expect(await confirmSubmission(store, config, token, {}, NOW)).toEqual({ ok: false });
    }
    expect(tables.consentChanges).toHaveLength(2);
  });
});

describe('confirmation pages', () => {
  it('lists the email types and links to the preferences page, escaped', () => {
    const { messages } = getPublicMessages('nl', undefined);
    const html = renderConfirmedHtml(messages, 'nl', ['<Nieuws>'], 'https://crm.test/s/consents/preferences?token=a&b');

    expect(html).toContain('Inschrijving bevestigd');
    expect(html).toContain('&lt;Nieuws&gt;');
    expect(html).toContain('href="https://crm.test/s/consents/preferences?token=a&amp;b"');
    expect(html).toContain('lang="nl"');
  });

  it('explains an invalid link', () => {
    const { messages } = getPublicMessages('fr', undefined);

    expect(renderInvalidLinkHtml(messages, 'fr')).toContain('Ce lien ne fonctionne plus');
  });
});
