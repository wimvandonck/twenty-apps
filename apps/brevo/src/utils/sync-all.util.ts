import { type BrevoDeps, type TwentyDeps } from 'src/types/brevo-deps';
import { ensureBrevoList } from 'src/utils/ensure-brevo-list.util';
import { syncPerson } from 'src/utils/sync-person.util';

// Puts every member of every synced list in Brevo, with their consents.
// Safe to repeat; catches up on anything a trigger missed.
export const syncAll = async (twenty: TwentyDeps, brevo: BrevoDeps) => {
  let contacts = 0;
  const lists = await twenty.getSyncedLists();

  for (const list of lists) {
    const brevoListId = await ensureBrevoList(twenty, brevo, list);

    for (const personId of await twenty.getMemberPersonIds(list.id)) {
      const { synced } = await syncPerson(twenty, brevo, personId, [brevoListId]);

      contacts += synced ? 1 : 0;
    }
  }

  return { lists: lists.length, contacts };
};
