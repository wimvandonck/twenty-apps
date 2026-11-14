import { type BrevoDeps, type SyncedList, type TwentyDeps } from 'src/types/brevo-deps';

// The Brevo list of a Twenty list, created the first time it is needed.
// Members added at once each start a run that may create one; after saving
// its own, a run reads the list again and gives way to one saved later.
export const ensureBrevoList = async (twenty: TwentyDeps, brevo: BrevoDeps, list: SyncedList): Promise<number> => {
  if (list.brevoListId !== null) {
    return list.brevoListId;
  }

  const brevoListId = await brevo.createList(list.name || 'Twenty list');

  await twenty.setBrevoListId(list.id, brevoListId);

  const saved = (await twenty.getList(list.id))?.brevoListId ?? null;

  if (saved !== null && saved !== brevoListId) {
    await brevo.deleteList(brevoListId).catch(() => undefined);

    return saved;
  }

  return brevoListId;
};
