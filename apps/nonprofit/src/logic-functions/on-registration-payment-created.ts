import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordCreateEvent } from 'twenty-sdk/define';

import { applyLinkedPayment } from 'src/utils/apply-linked-payment.util';

// A registration created with a payment takes over that payment's status at once.
const handler = async (event: DatabaseEventPayload<ObjectRecordCreateEvent<{ paymentId?: string | null }>>) =>
  applyLinkedPayment('registrations', event.recordId, event.properties.after?.paymentId);

export default defineLogicFunction({
  universalIdentifier: '565a48b4-5ca3-4803-a3ad-53d03817712a',
  name: 'on-registration-payment-created',
  description: 'Gives a registration created with a payment that payment\'s status',
  timeoutSeconds: 20,
  handler,
  databaseEventTriggerSettings: { eventName: 'registration.created' },
});
