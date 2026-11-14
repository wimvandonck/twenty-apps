import { type BrevoDeps, type TwentyDeps } from 'src/types/brevo-deps';
import { buildContactUpsert } from 'src/utils/build-contact-upsert.util';
import { consentAttributeName } from 'src/utils/consent-attribute-name.util';

// Writes a person to Brevo: names, a true or false attribute per consent,
// and optionally lists to add the contact to. People without an email are skipped.
export const syncPerson = async (twenty: TwentyDeps, brevo: BrevoDeps, personId: string, listIds: number[] = []) => {
  const person = await twenty.getPerson(personId);

  if (!person?.email) {
    return { synced: false };
  }

  const consents: Record<string, boolean> = {};

  for (const { emailTypeName, isGranted } of await twenty.getConsents(personId)) {
    const attribute = consentAttributeName(emailTypeName);

    await brevo.ensureBooleanAttribute(attribute);
    consents[attribute] = isGranted;
  }

  await brevo.upsertContact(
    buildContactUpsert({ email: person.email, firstName: person.firstName, lastName: person.lastName, consents, listIds }),
  );

  return { synced: true };
};
