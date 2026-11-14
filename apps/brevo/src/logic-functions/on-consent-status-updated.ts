import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordUpdateEvent } from 'twenty-sdk/define';

import { syncPerson } from 'src/utils/sync-person.util';
import { withBrevo } from 'src/utils/with-brevo.util';

// A consent given or withdrawn updates the attribute on the Brevo contact.
const handler = async (event: DatabaseEventPayload<ObjectRecordUpdateEvent<{ personId?: string | null }>>) => {
  const personId = event.properties.after?.personId;

  return personId ? withBrevo((twenty, brevo) => syncPerson(twenty, brevo, personId)) : { synced: false };
};

export default defineLogicFunction({
  universalIdentifier: '67fea9ef-4f94-40b9-89f9-beb7f2ce3650',
  name: 'on-consent-status-updated',
  description: 'Writes a changed consent to the Brevo contact',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: { eventName: 'consent.updated', updatedFields: ['status'] },
});
