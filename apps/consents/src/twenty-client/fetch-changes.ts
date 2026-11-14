import { type ConsentAction } from 'src/types/consent-action';
import { type RecordStore } from 'src/types/record-store';

export type ChangeSummary = { id: string; action: ConsentAction; submissionId: string | null; language: string | null };

// The changes of a consent, oldest first.
export const fetchChanges = async (store: RecordStore, consentId: string): Promise<ChangeSummary[]> => {
  const changes = await store.find(
    'consentChanges',
    { consentId },
    { orderBy: { field: 'occurredAt', direction: 'asc' }, limit: 200 },
  );

  return changes.map((change) => ({
    id: change.id,
    action: change.action as ConsentAction,
    submissionId: typeof change.submissionId === 'string' && change.submissionId !== '' ? change.submissionId : null,
    language: typeof change.language === 'string' && change.language !== '' ? change.language : null,
  }));
};
