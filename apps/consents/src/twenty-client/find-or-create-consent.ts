import { type ConsentRecord } from 'src/types/consent-record';
import { type RecordStore } from 'src/types/record-store';
import { personName } from 'src/utils/person-name.util';
import { toConsentRecord } from 'src/utils/to-consent-record.util';

// The consent of a person for an email type. Twenty has no unique key over
// two fields, so the app looks before it creates.
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

  return toConsentRecord(await store.create('consents', { personId, emailTypeId, name, status: null }));
};
