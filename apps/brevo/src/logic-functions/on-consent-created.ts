import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordCreateEvent } from 'twenty-sdk/define';

import { syncPerson } from 'src/utils/sync-person.util';
import { withBrevo } from 'src/utils/with-brevo.util';

// A new consent shows up as an attribute on the person's Brevo contact.
const handler = async (event: DatabaseEventPayload<ObjectRecordCreateEvent<{ personId?: string | null }>>) => {
  const personId = event.properties.after?.personId;

  return personId ? withBrevo((twenty, brevo) => syncPerson(twenty, brevo, personId)) : { synced: false };
};

export default defineLogicFunction({
  universalIdentifier: 'bcfeee7b-7137-4e25-b4c8-6864ab050480',
  name: 'on-consent-created',
  description: 'Writes a new consent to the Brevo contact',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: { eventName: 'consent.created' },
});
