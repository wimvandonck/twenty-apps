import { type RecordStore } from 'src/types/record-store';

// Makes the person a member of the list, or not. Safe to repeat.
export const setListMembership = async (
  store: RecordStore,
  listId: string,
  personId: string,
  isMember: boolean,
): Promise<void> => {
  const members = await store.find('messageListMembers', { listId, personId });

  if (isMember && members.length === 0) {
    await store.create('messageListMembers', { listId, personId });
  }

  if (!isMember) {
    for (const member of members) {
      await store.remove('messageListMembers', member.id);
    }
  }
};
