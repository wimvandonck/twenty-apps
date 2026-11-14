import { defineLogicFunction } from 'twenty-sdk/define';

import { createRecordStore } from 'src/twenty-client/create-record-store';
import { fetchPendingConsents } from 'src/twenty-client/fetch-pending-consents';
import { groupPendingForRetry } from 'src/utils/group-pending-for-retry.util';
import { readAppConfig } from 'src/utils/read-app-config.util';
import { sendConfirmation } from 'src/utils/send-confirmation.util';

// Sends confirmation mails that could not go out before, for example because
// Brevo's daily limit was reached.
const handler = async () => {
  const config = readAppConfig();

  if (!config.brevoApiKey) {
    return { retried: 0, sent: 0 };
  }

  const store = createRecordStore();
  const now = Date.now();
  const groups = groupPendingForRetry(await fetchPendingConsents(store), now);
  let sent = 0;

  for (const group of groups) {
    const result = await sendConfirmation(store, config, group, now);

    if (result.sent) {
      sent += 1;
    } else if (result.retry) {
      break;
    }
  }

  return { retried: groups.length, sent };
};

export default defineLogicFunction({
  universalIdentifier: '8afa6fdf-f3fe-4879-9210-8301f1d100e9',
  name: 'retry-confirmations',
  description: 'Sends confirmation mails that could not be sent earlier',
  timeoutSeconds: 120,
  handler,
  cronTriggerSettings: { pattern: '7 * * * *' },
});
