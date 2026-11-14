import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordCreateEvent } from 'twenty-sdk/define';

import { syncMembership } from 'src/utils/sync-membership.util';
import { withBrevo } from 'src/utils/with-brevo.util';

type Member = { listId?: string | null; personId?: string | null };

// Someone joining a synced list joins its Brevo list.
const handler = async (event: DatabaseEventPayload<ObjectRecordCreateEvent<Member>>) => {
  const { listId, personId } = event.properties.after ?? {};

  return listId && personId
    ? withBrevo((twenty, brevo) => syncMembership(twenty, brevo, listId, personId, true))
    : { synced: false };
};

export default defineLogicFunction({
  universalIdentifier: '3ed8d45a-6d7b-4eb4-983a-c9f1d14d6ccc',
  name: 'on-list-member-created',
  description: 'Adds a new member of a synced list to its Brevo list',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: { eventName: 'messageListMember.created' },
});
