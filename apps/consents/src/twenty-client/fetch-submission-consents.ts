import { type ConsentRecord } from 'src/types/consent-record';
import { type RecordStore } from 'src/types/record-store';
import { toConsentRecord } from 'src/utils/to-consent-record.util';

// The consents a form submission asked for, whatever their status now.
export const fetchSubmissionConsents = async (store: RecordStore, submissionId: string): Promise<ConsentRecord[]> => {
  let changes = await store.find('consentChanges', { submissionId, action: 'REQUESTED' }, { limit: 100 });

  // A request recorded without a submission is confirmed by its own id.
  if (changes.length === 0) {
    const single = await store.findOne('consentChanges', submissionId);

    changes = single && single.action === 'REQUESTED' ? [single] : [];
  }
  const consentIds = [...new Set(changes.map((change) => String(change.consentId)))];
  const consents = await Promise.all(consentIds.map((id) => store.findOne('consents', id)));

  return consents.filter((consent) => consent !== null).map(toConsentRecord);
};
