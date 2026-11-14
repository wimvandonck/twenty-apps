import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordCreateEvent } from 'twenty-sdk/define';

import { createRecordStore } from 'src/twenty-client/create-record-store';
import { readAppConfig } from 'src/utils/read-app-config.util';
import { reconcileConsent } from 'src/utils/reconcile-consent.util';

type ChangeRecord = { consentId?: string | null };

// A change can also be added by hand or by an import; the consent follows it.
const handler = async (event: DatabaseEventPayload<ObjectRecordCreateEvent<ChangeRecord>>) => {
  const consentId = event.properties.after?.consentId;

  if (!consentId) {
    return { updated: false };
  }

  return { updated: await reconcileConsent(createRecordStore(), readAppConfig(), consentId, Date.now()) };
};

export default defineLogicFunction({
  universalIdentifier: 'e35699ec-4800-485a-9b9a-5f29df399c74',
  name: 'on-consent-change-created',
  description: 'Keeps the status of a consent equal to what its changes lead to',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: { eventName: 'consentChange.created' },
});
