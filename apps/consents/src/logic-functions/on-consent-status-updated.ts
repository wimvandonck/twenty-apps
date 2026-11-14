import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordUpdateEvent } from 'twenty-sdk/define';

import { createRecordStore } from 'src/twenty-client/create-record-store';
import { handleStatusEdit } from 'src/utils/handle-status-edit.util';
import { readAppConfig } from 'src/utils/read-app-config.util';

// A status edited by hand in Twenty is logged as a manual change.
const handler = async (event: DatabaseEventPayload<ObjectRecordUpdateEvent<{ status?: string | null }>>) => {
  if (event.properties.before?.status === event.properties.after?.status) {
    return { checked: false };
  }

  await handleStatusEdit(createRecordStore(), readAppConfig(), event.recordId, Date.now());

  return { checked: true };
};

export default defineLogicFunction({
  universalIdentifier: '7e08a1f5-c19f-4862-9439-e1fe13236568',
  name: 'on-consent-status-updated',
  description: 'Logs a consent status changed by hand as a manual change',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: { eventName: 'consent.updated', updatedFields: ['status'] },
});
