import { type AppConfig } from 'src/types/app-config';
import { type RecordStore } from 'src/types/record-store';
import { buildPreferencesUrl } from 'src/utils/build-preferences-url.util';

const BATCH_SIZE = 100;
const MAX_BATCHES = 1000;

// Gives every person without a preferences link one. Returns how many got one.
export const backfillPreferenceLinks = async (store: RecordStore, config: AppConfig): Promise<number> => {
  let updated = 0;

  for (let batch = 0; batch < MAX_BATCHES; batch += 1) {
    const people = await store.find('people', { preferencesUrl: null }, { limit: BATCH_SIZE });

    for (const person of people) {
      await store.update('people', person.id, {
        preferencesUrl: buildPreferencesUrl(config.publicBaseUrl, person.id, config.signingSecret),
      });
    }

    updated += people.length;

    if (people.length < BATCH_SIZE) {
      break;
    }
  }

  return updated;
};
