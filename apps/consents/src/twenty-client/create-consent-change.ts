import { type ConsentChangeInput } from 'src/types/consent-change-input';
import { type RecordStore } from 'src/types/record-store';

// Records one change as proof. Changes are never edited afterwards.
export const createConsentChange = async (
  store: RecordStore,
  consentId: string,
  input: ConsentChangeInput,
): Promise<{ id: string }> => {
  const occurredAt = input.occurredAt ?? new Date().toISOString();
  const { id } = await store.create('consentChanges', {
    ...input,
    occurredAt,
    consentId,
    name: `${input.action} ${occurredAt.slice(0, 16).replace('T', ' ')}`,
  });

  return { id };
};
