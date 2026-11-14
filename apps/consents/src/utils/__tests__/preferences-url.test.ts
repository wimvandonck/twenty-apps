import { describe, expect, it } from 'vitest';

import { createMemoryRecordStore } from 'src/twenty-client/__tests__/memory-record-store';
import { type AppConfig } from 'src/types/app-config';
import { backfillPreferenceLinks } from 'src/utils/backfill-preference-links.util';
import { verifyToken } from 'src/utils/verify-token.util';

const config: AppConfig = {
  signingSecret: 'secret',
  brevoApiKey: null,
  senderEmail: '',
  senderName: '',
  organizationName: '',
  publicBaseUrl: 'https://crm.test',
};

describe('backfillPreferenceLinks', () => {
  it('gives every person without a link their own working link', async () => {
    const { store, tables } = createMemoryRecordStore({
      people: [
        { id: 'ann', preferencesUrl: '' },
        { id: 'bob', preferencesUrl: 'https://crm.test/kept' },
        { id: 'cas' },
      ],
    });

    expect(await backfillPreferenceLinks(store, config)).toBe(2);

    const token = (url: unknown) => new URL(String(url)).searchParams.get('token') ?? '';

    expect(verifyToken(token(tables.people[0].preferencesUrl), 'secret', 0)).toEqual({ kind: 'preferences', personId: 'ann' });
    expect(tables.people[1].preferencesUrl).toBe('https://crm.test/kept');
    expect(verifyToken(token(tables.people[2].preferencesUrl), 'secret', 0)).toEqual({ kind: 'preferences', personId: 'cas' });
  });
});
