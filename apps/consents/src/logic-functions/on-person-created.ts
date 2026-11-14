import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordCreateEvent } from 'twenty-sdk/define';

import { createRecordStore } from 'src/twenty-client/create-record-store';
import { buildPreferencesUrl } from 'src/utils/build-preferences-url.util';
import { readAppConfig } from 'src/utils/read-app-config.util';

// Every new person gets a personal link to the preferences page, so mails
// can insert it as a variable.
const handler = async (event: DatabaseEventPayload<ObjectRecordCreateEvent<{ preferencesUrl?: string | null }>>) => {
  if (event.properties.after?.preferencesUrl) {
    return { updated: false };
  }

  const config = readAppConfig();

  await createRecordStore().update('people', event.recordId, {
    preferencesUrl: buildPreferencesUrl(config.publicBaseUrl, event.recordId, config.signingSecret),
  });

  return { updated: true };
};

export default defineLogicFunction({
  universalIdentifier: 'd93685c3-de48-4f9e-b4de-edef8a8e2eae',
  name: 'on-person-created',
  description: 'Gives a new person a link to the email preferences page',
  timeoutSeconds: 20,
  handler,
  databaseEventTriggerSettings: { eventName: 'person.created' },
});
