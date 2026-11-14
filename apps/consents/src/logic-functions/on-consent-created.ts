import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordCreateEvent } from 'twenty-sdk/define';

import { createRecordStore } from 'src/twenty-client/create-record-store';
import { handleStatusEdit } from 'src/utils/handle-status-edit.util';
import { readAppConfig } from 'src/utils/read-app-config.util';

type CreatedConsent = { status?: string | null; updatedAt?: string | null };

// A consent created by hand or by an import with a status gets a manual
// change as proof; one created by the app itself starts empty.
const handler = async (event: DatabaseEventPayload<ObjectRecordCreateEvent<CreatedConsent>>) => {
  const after = event.properties.after;

  if (!after?.status) {
    return { checked: false };
  }

  await handleStatusEdit(createRecordStore(), readAppConfig(), event.recordId, Date.now(), {
    status: after.status,
    updatedAt: after.updatedAt ?? null,
  });

  return { checked: true };
};

export default defineLogicFunction({
  universalIdentifier: 'b5697874-b360-4511-a176-0ec3aac0d6cc',
  name: 'on-consent-created',
  description: 'Logs a consent created with a status as a manual change',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: { eventName: 'consent.created' },
});
