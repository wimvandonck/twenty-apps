import { type TwentyDeps } from 'src/types/brevo-deps';

// An unsubscribe in Brevo withdraws the person's consents in Twenty (with
// Brevo as source) and takes the person off the lists the mail was sent to.
export const handleUnsubscribe = async (twenty: TwentyDeps, unsubscribe: { email: string; listIds: number[] }) => {
  const personId = await twenty.findPersonIdByEmail(unsubscribe.email);

  if (!personId) {
    return { handled: false };
  }

  await twenty.withdrawAllConsents(personId);

  if (unsubscribe.listIds.length > 0) {
    for (const list of await twenty.getListsByBrevoIds(unsubscribe.listIds)) {
      await twenty.removeMembership(list.id, personId);
    }
  }

  return { handled: true };
};
