import { defineLogicFunction } from 'twenty-sdk/define';

import { createRecordStore } from 'src/twenty-client/create-record-store';
import { fetchPendingConsents } from 'src/twenty-client/fetch-pending-consents';
import { backfillPreferenceLinks } from 'src/utils/backfill-preference-links.util';
import { groupPendingForRetry } from 'src/utils/group-pending-for-retry.util';
import { readAppConfigOrNull } from 'src/utils/read-app-config.util';
import { sendConfirmation } from 'src/utils/send-confirmation.util';

// Sends confirmation mails that could not go out before, for example because
// Brevo's daily limit was reached. Also gives people still without a
// preferences link one, such as those who existed before the secret was set.
const handler = async () => {
  const config = readAppConfigOrNull();

  if (!config) {
    return { linked: 0, retried: 0, sent: 0 };
  }

  const store = createRecordStore();
  const linked = await backfillPreferenceLinks(store, config);

  if (!config.brevoApiKey) {
    return { linked, retried: 0, sent: 0 };
  }

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

  return { linked, retried: groups.length, sent };
};

export default defineLogicFunction({
  universalIdentifier: '8afa6fdf-f3fe-4879-9210-8301f1d100e9',
  name: 'retry-confirmations',
  description: 'Sends confirmation mails that could not be sent earlier and fills in missing preference links',
  timeoutSeconds: 120,
  handler,
  cronTriggerSettings: { pattern: '7 * * * *' },
});
