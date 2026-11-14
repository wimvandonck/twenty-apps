import { type BrevoDeps, type TwentyDeps } from 'src/types/brevo-deps';
import { ensureBrevoList } from 'src/utils/ensure-brevo-list.util';
import { syncPerson } from 'src/utils/sync-person.util';

// Follows one membership of a synced list in Brevo: joining adds the contact
// to the Brevo list, leaving takes it off.
export const syncMembership = async (
  twenty: TwentyDeps,
  brevo: BrevoDeps,
  listId: string,
  personId: string,
  isMember: boolean,
) => {
  const list = await twenty.getList(listId);

  if (!list?.isSynced) {
    return { synced: false };
  }

  const brevoListId = await ensureBrevoList(twenty, brevo, list);

  if (isMember) {
    return syncPerson(twenty, brevo, personId, [brevoListId]);
  }

  const person = await twenty.getPerson(personId);

  if (person?.email) {
    await brevo.removeFromList(brevoListId, [person.email.toLowerCase()]);
  }

  return { synced: Boolean(person?.email) };
};
