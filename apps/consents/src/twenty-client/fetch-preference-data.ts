import { type ConsentStatus } from 'src/types/consent-status';
import { type PreferenceData } from 'src/types/preference-data';
import { type RecordStore } from 'src/types/record-store';
import { personName } from 'src/utils/person-name.util';

const text = (value: unknown) => (typeof value === 'string' ? value : '');

// What the preferences page shows for a person, or null when the person is gone.
export const fetchPreferenceData = async (store: RecordStore, personId: string): Promise<PreferenceData | null> => {
  const person = await store.findOne('people', personId);

  if (!person) {
    return null;
  }

  const [emailTypes, consents, lists, memberships] = await Promise.all([
    store.find('emailTypes', { isActive: true }, { orderBy: { field: 'name', direction: 'asc' }, limit: 200 }),
    store.find('consents', { personId }, { limit: 200 }),
    store.find('messageLists', { showOnPreferencePage: true }, { orderBy: { field: 'name', direction: 'asc' }, limit: 200 }),
    store.find('messageListMembers', { personId }, { limit: 500 }),
  ]);
  const statusByType = new Map(consents.map((consent) => [consent.emailTypeId, consent.status as ConsentStatus | null]));
  const memberOf = new Set(memberships.map((member) => member.listId));

  return {
    firstName: personName(person).firstName,
    emailTypes: emailTypes.map((type) => ({
      id: type.id,
      name: text(type.name),
      description: text(type.description),
      status: statusByType.get(type.id) ?? null,
    })),
    lists: lists.map((list) => ({
      id: list.id,
      name: text(list.name),
      requiredEmailTypeId: typeof list.requiredEmailTypeId === 'string' && list.requiredEmailTypeId !== '' ? list.requiredEmailTypeId : null,
      isMember: memberOf.has(list.id),
    })),
  };
};
