import { createConsentChange } from 'src/twenty-client/create-consent-change';
import { fetchChanges } from 'src/twenty-client/fetch-changes';
import { updateConsent } from 'src/twenty-client/update-consent';
import { type AppConfig } from 'src/types/app-config';
import { type RecordStore } from 'src/types/record-store';
import { deriveStatus } from 'src/utils/derive-status.util';
import { reconcileConsent } from 'src/utils/reconcile-consent.util';
import { toConsentRecord } from 'src/utils/to-consent-record.util';

// Reacts to a status that does not match the history: someone edited it in
// Twenty. Granted and withdrawn are logged as a manual change; anything else
// (pending, empty) cannot be proven and is put back.
//
// The edit from the event guards against events handled late: an edit the
// record no longer shows, or one older than the latest change, is the app's
// own write in progress or already superseded.
export const handleStatusEdit = async (
  store: RecordStore,
  config: AppConfig,
  consentId: string,
  now: number,
  edit?: { status: string | null; updatedAt: string | null },
): Promise<void> => {
  const record = await store.findOne('consents', consentId);

  if (!record) {
    return;
  }

  const consent = toConsentRecord(record);
  const changes = await fetchChanges(store, consentId);
  const derived = deriveStatus(changes.map((change) => change.action));
  const latestCreatedAt = changes[changes.length - 1]?.createdAt ?? null;

  if (edit && ((edit.status ?? null) !== consent.status || (edit.updatedAt && latestCreatedAt && latestCreatedAt > edit.updatedAt))) {
    return;
  }

  if (consent.status === derived) {
    return;
  }

  if (consent.status === 'GRANTED' || consent.status === 'WITHDRAWN') {
    await createConsentChange(store, consentId, {
      action: consent.status,
      source: 'MANUAL',
      occurredAt: new Date(now).toISOString(),
      note: 'Status changed in Twenty',
    });
    await updateConsent(
      store,
      consentId,
      consent.status === 'GRANTED'
        ? { grantedAt: new Date(now).toISOString(), confirmationUrl: null }
        : { withdrawnAt: new Date(now).toISOString(), confirmationUrl: null },
    );

    return;
  }

  await updateConsent(store, consentId, { status: derived });
  await reconcileConsent(store, config, consentId, now);
};
