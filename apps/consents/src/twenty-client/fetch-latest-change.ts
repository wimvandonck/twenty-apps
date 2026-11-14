import { type ConsentAction } from 'src/types/consent-action';
import { type RecordStore } from 'src/types/record-store';

export type LatestChange = { id: string; action: ConsentAction; submissionId: string | null; language: string | null; occurredAt: string | null };

export const fetchLatestChange = async (store: RecordStore, consentId: string): Promise<LatestChange | null> => {
  const [latest] = await store.find(
    'consentChanges',
    { consentId },
    { orderBy: { field: 'occurredAt', direction: 'desc' }, limit: 1 },
  );

  if (!latest) {
    return null;
  }

  const text = (value: unknown) => (typeof value === 'string' && value !== '' ? value : null);

  return {
    id: latest.id,
    action: latest.action as ConsentAction,
    submissionId: text(latest.submissionId),
    language: text(latest.language),
    occurredAt: text(latest.occurredAt),
  };
};
