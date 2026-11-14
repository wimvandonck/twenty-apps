import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordDeleteEvent } from 'twenty-sdk/define';

import { syncMembership } from 'src/utils/sync-membership.util';
import { withBrevo } from 'src/utils/with-brevo.util';

type Member = { listId?: string | null; personId?: string | null };

// Someone leaving a synced list leaves its Brevo list.
const handler = async (event: DatabaseEventPayload<ObjectRecordDeleteEvent<Member>>) => {
  const { listId, personId } = event.properties.before ?? {};

  return listId && personId
    ? withBrevo((twenty, brevo) => syncMembership(twenty, brevo, listId, personId, false))
    : { synced: false };
};

export default defineLogicFunction({
  universalIdentifier: 'bdd228b2-36a8-482c-ae1e-78cd53b1485b',
  name: 'on-list-member-deleted',
  description: 'Takes a former member of a synced list off its Brevo list',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: { eventName: 'messageListMember.deleted' },
});
