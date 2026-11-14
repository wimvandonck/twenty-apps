import { type ConsentAction } from 'src/types/consent-action';
import { type RecordStore } from 'src/types/record-store';

export type ChangeSummary = {
  id: string;
  action: ConsentAction;
  submissionId: string | null;
  language: string | null;
  createdAt: string | null;
};

const HISTORY_LIMIT = 200;

// The newest changes of a consent, oldest first. A grant, confirmation or
// withdrawal decides the status on its own, so the newest changes are enough
// to derive it.
export const fetchChanges = async (store: RecordStore, consentId: string): Promise<ChangeSummary[]> => {
  const changes = await store.find(
    'consentChanges',
    { consentId },
    { orderBy: { field: 'occurredAt', direction: 'desc' }, limit: HISTORY_LIMIT },
  );

  return [...changes].reverse().map((change) => ({
    id: change.id,
    action: change.action as ConsentAction,
    submissionId: typeof change.submissionId === 'string' && change.submissionId !== '' ? change.submissionId : null,
    language: typeof change.language === 'string' && change.language !== '' ? change.language : null,
    createdAt: typeof change.createdAt === 'string' ? change.createdAt : null,
  }));
};
