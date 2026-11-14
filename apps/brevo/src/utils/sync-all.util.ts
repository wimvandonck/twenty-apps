import { type BrevoDeps, type TwentyDeps } from 'src/types/brevo-deps';
import { ensureBrevoList } from 'src/utils/ensure-brevo-list.util';
import { syncPerson } from 'src/utils/sync-person.util';

// Brevo's rate limit: the rest waits for the next run.
const isRateLimited = (error: unknown) => error instanceof Error && error.message.includes('(429)');

// Puts every member of every synced list in Brevo, with their consents.
// Safe to repeat; catches up on anything a trigger missed. A contact Brevo
// refuses is counted and skipped.
export const syncAll = async (twenty: TwentyDeps, brevo: BrevoDeps) => {
  let contacts = 0;
  let failed = 0;
  const lists = await twenty.getSyncedLists();

  for (const list of lists) {
    const brevoListId = await ensureBrevoList(twenty, brevo, list);

    for (const personId of await twenty.getMemberPersonIds(list.id)) {
      try {
        const { synced } = await syncPerson(twenty, brevo, personId, [brevoListId]);

        contacts += synced ? 1 : 0;
      } catch (error) {
        failed += 1;
        console.error(`Brevo sync failed for person ${personId}`, error);

        if (isRateLimited(error)) {
          return { lists: lists.length, contacts, failed };
        }
      }
    }
  }

  return { lists: lists.length, contacts, failed };
};
