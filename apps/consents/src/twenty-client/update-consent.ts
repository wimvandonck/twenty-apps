import { type ConsentRecord } from 'src/types/consent-record';
import { type RecordStore } from 'src/types/record-store';

export const updateConsent = async (
  store: RecordStore,
  id: string,
  patch: Partial<Omit<ConsentRecord, 'id'>>,
): Promise<void> => {
  if (Object.keys(patch).length > 0) {
    await store.update('consents', id, patch);
  }
};
