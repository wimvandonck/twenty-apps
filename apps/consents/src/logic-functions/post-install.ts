import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import { createRecordStore } from 'src/twenty-client/create-record-store';
import { backfillPreferenceLinks } from 'src/utils/backfill-preference-links.util';
import { readAppConfig } from 'src/utils/read-app-config.util';

// Gives existing people a preferences link. The signing secret is set after
// installing, so this also runs on upgrades and does nothing without it.
export default definePostInstallLogicFunction({
  universalIdentifier: '17215df8-a776-4de1-a0bc-41348e6bab06',
  name: 'post-install',
  description: 'Gives existing people a link to the email preferences page',
  timeoutSeconds: 900,
  shouldRunOnVersionUpgrade: true,
  handler: async () => {
    if (!process.env.CONSENT_SIGNING_SECRET) {
      return { updated: 0, skipped: 'no signing secret yet' };
    }

    return { updated: await backfillPreferenceLinks(createRecordStore(), readAppConfig()) };
  },
});
