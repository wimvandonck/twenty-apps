import { fetchChanges } from 'src/twenty-client/fetch-changes';
import { updateConsent } from 'src/twenty-client/update-consent';
import { type AppConfig } from 'src/types/app-config';
import { type RecordStore } from 'src/types/record-store';
import { applyStatus } from 'src/utils/apply-status.util';
import { confirmationUrlFor } from 'src/utils/confirmation-url-for.util';
import { deriveStatus } from 'src/utils/derive-status.util';
import { toConsentRecord } from 'src/utils/to-consent-record.util';

// Writes the status the history leads to, if the consent does not have it
// yet. Returns whether anything was written.
export const reconcileConsent = async (store: RecordStore, config: AppConfig, consentId: string, now: number): Promise<boolean> => {
  const record = await store.findOne('consents', consentId);

  if (!record) {
    return false;
  }

  const consent = toConsentRecord(record);
  const changes = await fetchChanges(store, consentId);
  const status = deriveStatus(changes.map((change) => change.action));

  if (status === consent.status && (status !== 'PENDING' || consent.confirmationUrl !== null)) {
    return false;
  }

  const patch = applyStatus(
    consent,
    status,
    new Date(now).toISOString(),
    status === 'PENDING' ? (consent.confirmationUrl ?? confirmationUrlFor(changes, config, now)) : null,
  );

  await updateConsent(store, consentId, patch);

  return Object.keys(patch).length > 0;
};
