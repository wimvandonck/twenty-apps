import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordCreateEvent } from 'twenty-sdk/define';

import { restRecords } from 'src/twenty-client/rest-records';
import { type CurrencyValue } from 'src/types/currency-value';
import { completeMembership } from 'src/utils/complete-membership.util';
import { today } from 'src/utils/today.util';

type MembershipRecord = {
  name?: string | null;
  startsOn?: string | null;
  endsOn?: string | null;
  amount?: CurrencyValue;
  membershipTypeId?: string | null;
  memberId?: string | null;
  companyId?: string | null;
};

const text = (value: unknown) => (typeof value === 'string' ? value : '');

// A new membership gets a name, a start, an end and an amount from its type.
const handler = async (event: DatabaseEventPayload<ObjectRecordCreateEvent<MembershipRecord>>) => {
  const membership = event.properties.after ?? {};
  const records = restRecords();
  const [type, member, company] = await Promise.all([
    membership.membershipTypeId ? records.get('membershipTypes', membership.membershipTypeId) : null,
    membership.memberId ? records.get('people', membership.memberId) : null,
    membership.companyId ? records.get('companies', membership.companyId) : null,
  ]);
  const personName = (member?.name ?? {}) as { firstName?: string; lastName?: string };
  const memberName =
    [personName.firstName, personName.lastName].filter(Boolean).join(' ') || text(company?.name);
  const patch = completeMembership(
    {
      name: membership.name ?? '',
      startsOn: membership.startsOn ?? null,
      endsOn: membership.endsOn ?? null,
      amount: membership.amount ?? null,
    },
    type ? { name: text(type.name), price: (type.price as CurrencyValue) ?? null, duration: text(type.duration) } : null,
    memberName,
    today(),
  );

  if (Object.keys(patch).length > 0) {
    await records.update('memberships', event.recordId, patch);
  }

  return { updated: Object.keys(patch) };
};

export default defineLogicFunction({
  universalIdentifier: '6cfcbb37-644e-4195-9379-179fc1e148fa',
  name: 'on-membership-created',
  description: 'Fills the name, period and amount of a new membership from its type',
  timeoutSeconds: 20,
  handler,
  databaseEventTriggerSettings: { eventName: 'membership.created' },
});
