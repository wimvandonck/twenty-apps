import { RestApiClient } from 'twenty-client-sdk/rest';

import { type SyncedList, type TwentyDeps } from 'src/types/brevo-deps';

type Row = { id: string } & Record<string, unknown>;

const toList = (row: Row): SyncedList => ({
  id: row.id,
  name: typeof row.name === 'string' ? row.name : '',
  // syncMetBrevo is the workspace's own checkbox for lists to sync.
  isSynced: row.syncMetBrevo === true || row.syncWithBrevo === true,
  brevoListId: typeof row.brevoListId === 'number' ? row.brevoListId : null,
});

// The people, consents and lists the sync reads, over Twenty's REST API.
export const createTwentyDeps = (client: RestApiClient = new RestApiClient()): TwentyDeps => {
  const list = async (namePlural: string, filter?: string, limit = 200): Promise<Row[]> => {
    const response = await client.get<{ data: Record<string, Row[]> }>(`/rest/${namePlural}`, {
      query: { limit, ...(filter ? { filter } : {}) },
    });

    return Object.values(response.data)[0] ?? [];
  };
  const one = async (namePlural: string, id: string): Promise<Row | null> => {
    try {
      return Object.values((await client.get<{ data: Record<string, Row | null> }>(`/rest/${namePlural}/${id}`)).data)[0] ?? null;
    } catch {
      return null;
    }
  };

  return {
    getPerson: async (personId) => {
      const person = await one('people', personId);

      if (!person) {
        return null;
      }

      const name = (person.name ?? {}) as { firstName?: string; lastName?: string };
      const email = (person.emails as { primaryEmail?: string } | undefined)?.primaryEmail;

      return { id: person.id, email: email && email !== '' ? email : null, firstName: name.firstName ?? '', lastName: name.lastName ?? '' };
    },
    getConsents: async (personId) => {
      const consents = await list('consents', `personId[eq]:"${personId}"`);
      const types = await Promise.all(consents.map((consent) => one('emailTypes', String(consent.emailTypeId))));

      return consents.flatMap((consent, index) =>
        typeof types[index]?.name === 'string'
          ? [{ emailTypeName: types[index]?.name as string, isGranted: consent.status === 'GRANTED' }]
          : [],
      );
    },
    getList: async (listId) => {
      const row = await one('messageLists', listId);

      return row ? toList(row) : null;
    },
    getSyncedLists: async () => (await list('messageLists')).map(toList).filter((entry) => entry.isSynced),
    setBrevoListId: async (listId, brevoListId) => {
      await client.patch(`/rest/messageLists/${listId}`, { brevoListId });
    },
    getMemberPersonIds: async (listId) =>
      (await list('messageListMembers', `listId[eq]:"${listId}"`, 500)).map((member) => String(member.personId)),
    findPersonIdByEmail: async (email) =>
      (await list('people', `emails.primaryEmail[ilike]:"${email.replace(/"/g, '')}"`, 1))[0]?.id ?? null,
    withdrawAllConsents: async (personId) => {
      const active = (await list('consents', `personId[eq]:"${personId}"`)).filter(
        (consent) => consent.status === 'GRANTED' || consent.status === 'PENDING',
      );

      if (active.length > 0) {
        await client.post('/s/consents/changes', {
          personId,
          changes: active.map((consent) => ({
            emailTypeId: consent.emailTypeId,
            action: 'WITHDRAWN',
            source: 'BREVO',
            note: 'Unsubscribed in Brevo',
          })),
        });
      }
    },
    getListsByBrevoIds: async (brevoListIds) =>
      (await list('messageLists')).map(toList).filter((entry) => entry.brevoListId !== null && brevoListIds.includes(entry.brevoListId)),
    removeMembership: async (listId, personId) => {
      for (const member of await list('messageListMembers', `listId[eq]:"${listId}",personId[eq]:"${personId}"`)) {
        await client.delete(`/rest/messageListMembers/${member.id}`);
      }
    },
  };
};
