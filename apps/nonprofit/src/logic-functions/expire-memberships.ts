import { defineLogicFunction } from 'twenty-sdk/define';

import { restRecords } from 'src/twenty-client/rest-records';
import { today } from 'src/utils/today.util';

// Every night, active memberships whose end date has passed expire.
const handler = async () => {
  const records = restRecords();
  const expired = await records.list('memberships', `and(status[eq]:ACTIVE,endsOn[lt]:"${today()}")`);

  for (const membership of expired) {
    await records.update('memberships', membership.id, { status: 'EXPIRED' });
  }

  return { expired: expired.length };
};

export default defineLogicFunction({
  universalIdentifier: 'e4c10369-db81-427a-8b6a-e0637e6fc871',
  name: 'expire-memberships',
  description: 'Marks active memberships whose end date has passed as expired',
  timeoutSeconds: 120,
  handler,
  cronTriggerSettings: { pattern: '17 2 * * *' },
});
