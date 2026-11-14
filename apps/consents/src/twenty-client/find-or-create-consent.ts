import { type ConsentRecord } from 'src/types/consent-record';
import { type RecordStore } from 'src/types/record-store';
import { personName } from 'src/utils/person-name.util';
import { toConsentRecord } from 'src/utils/to-consent-record.util';

// The consent of a person for an email type. Twenty has no unique key over
// two fields, so the app looks before it creates and checks after.
export const findOrCreateConsent = async (
  store: RecordStore,
  personId: string,
  emailTypeId: string,
): Promise<ConsentRecord> => {
  const [existing] = await store.find('consents', { personId, emailTypeId }, { limit: 1 });

  if (existing) {
    return toConsentRecord(existing);
  }

  const [person, emailType] = await Promise.all([
    store.findOne('people', personId),
    store.findOne('emailTypes', emailTypeId),
  ]);
  const name = [personName(person).fullName, typeof emailType?.name === 'string' ? emailType.name : '']
    .filter((part) => part !== '')
    .join(' – ');

  const created = await store.create('consents', { personId, emailTypeId, name, status: null });
  // Two requests at the same moment can both create one; the oldest wins.
  const [oldest] = await store.find(
    'consents',
    { personId, emailTypeId },
    { orderBy: { field: 'createdAt', direction: 'asc' }, limit: 1 },
  );

  if (oldest && oldest.id !== created.id) {
    await store.remove('consents', created.id);

    return toConsentRecord(oldest);
  }

  return toConsentRecord(created);
};
