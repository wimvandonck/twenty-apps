import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordUpdateEvent } from 'twenty-sdk/define';

import { restRecords } from 'src/twenty-client/rest-records';
import { paymentEffects, type StatusChange } from 'src/utils/payment-effects.util';

// A payment's status flows to what it pays for: registrations keep a copy,
// memberships become active and orders paid.
const handler = async (event: DatabaseEventPayload<ObjectRecordUpdateEvent<{ status?: string | null }>>) => {
  const status = event.properties.after?.status;

  if (!status || status === event.properties.before?.status) {
    return { updated: 0 };
  }

  const records = restRecords();
  const effects = paymentEffects(status);
  const byPayment = `paymentId[eq]:"${event.recordId}"`;
  let updated = 0;

  for (const registration of await records.list('registrations', byPayment)) {
    if (registration.paymentStatus !== effects.registrationPaymentStatus) {
      await records.update('registrations', registration.id, { paymentStatus: effects.registrationPaymentStatus });
      updated += 1;
    }
  }

  const follow = async (namePlural: string, change: StatusChange) => {
    if (!change) {
      return;
    }

    for (const record of await records.list(namePlural, byPayment)) {
      if (change.from.includes(String(record.status))) {
        await records.update(namePlural, record.id, { status: change.to });
        updated += 1;
      }
    }
  };

  await follow('memberships', effects.membership);
  await follow('orders', effects.order);

  return { updated };
};

export default defineLogicFunction({
  universalIdentifier: 'af8acd6e-bb74-4c55-a30b-0ad668a9d4dc',
  name: 'on-payment-status-updated',
  description: 'Passes a payment status on to its registrations, memberships and orders',
  timeoutSeconds: 60,
  handler,
  databaseEventTriggerSettings: { eventName: 'payment.updated', updatedFields: ['status'] },
});
