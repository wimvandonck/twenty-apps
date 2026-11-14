import { describe, expect, it } from 'vitest';

import { createMemoryRecordStore } from 'src/twenty-client/__tests__/memory-record-store';
import { type AppConfig } from 'src/types/app-config';
import { savePreferences } from 'src/utils/save-preferences.util';
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
const token = signToken({ kind: 'preferences', personId: 'ann' }, 'secret');

const seed = () =>
  createMemoryRecordStore({
    people: [{ id: 'ann', name: { firstName: 'Ann' } }],
    emailTypes: [{ id: 'news', name: 'Nieuwsbrief', description: '', isActive: true }],
    messageLists: [{ id: 'climate', name: 'Klimaat', showOnPreferencePage: true, requiredEmailTypeId: 'news' }],
  });

describe('savePreferences', () => {
  it('grants consent, joins the list and logs the page as source', async () => {
    const { store, tables } = seed();

    const result = await savePreferences(store, config, { token, consent: ['news'], list: ['climate'] }, { ipAddress: '9.9.9.9' }, NOW);

    expect(result.ok).toBe(true);
    expect(tables.consents[0].status).toBe('GRANTED');
    expect(tables.consentChanges[0]).toMatchObject({ action: 'GRANTED', source: 'PREFERENCE_PAGE', ipAddress: '9.9.9.9' });
    expect(tables.messageListMembers).toEqual([expect.objectContaining({ listId: 'climate', personId: 'ann' })]);
  });

  it('rejects a confirmation token', async () => {
    const { store, tables } = seed();
    const confirm = signToken({ kind: 'confirm', submissionId: 's', expiresAt: NOW + 1 }, 'secret');

    expect(await savePreferences(store, config, { token: confirm, consent: ['news'], list: [] }, {}, NOW)).toEqual({ ok: false });
    expect(tables.consentChanges ?? []).toHaveLength(0);
  });
});
