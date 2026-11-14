import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordUpdateEvent } from 'twenty-sdk/define';

import { applyLinkedPayment } from 'src/utils/apply-linked-payment.util';

// A registration linked to a payment takes over that payment's status at once.
const handler = async (event: DatabaseEventPayload<ObjectRecordUpdateEvent<{ paymentId?: string | null }>>) =>
  applyLinkedPayment('registrations', event.recordId, event.properties.after?.paymentId);

export default defineLogicFunction({
  universalIdentifier: '56cdeb96-49fa-4cc5-9e4b-b68e87fa23dc',
  name: 'on-registration-payment-linked',
  description: 'Gives a registration linked to a payment that payment\'s status',
  timeoutSeconds: 20,
  handler,
  databaseEventTriggerSettings: { eventName: 'registration.updated', updatedFields: ['paymentId'] },
});
