import { type BrevoDeps, type SyncedList, type TwentyDeps } from 'src/types/brevo-deps';

// The Brevo list of a Twenty list, created the first time it is needed.
export const ensureBrevoList = async (twenty: TwentyDeps, brevo: BrevoDeps, list: SyncedList): Promise<number> => {
  if (list.brevoListId !== null) {
    return list.brevoListId;
  }

  const brevoListId = await brevo.createList(list.name || 'Twenty list');

  await twenty.setBrevoListId(list.id, brevoListId);

  return brevoListId;
};
