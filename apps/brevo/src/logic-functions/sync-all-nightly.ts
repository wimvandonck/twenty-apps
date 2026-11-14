import { defineLogicFunction } from 'twenty-sdk/define';

import { syncAll } from 'src/utils/sync-all.util';
import { withBrevo } from 'src/utils/with-brevo.util';

// Every night, every member of every synced list is put in Brevo again.
export default defineLogicFunction({
  universalIdentifier: '0531f46d-3065-4210-8b7c-942425d2b085',
  name: 'sync-all-nightly',
  description: 'Puts every member of every synced list in Brevo, with their consents',
  timeoutSeconds: 900,
  handler: async () => withBrevo(syncAll),
  cronTriggerSettings: { pattern: '43 3 * * *' },
});
