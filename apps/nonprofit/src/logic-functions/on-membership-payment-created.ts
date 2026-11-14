import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordCreateEvent } from 'twenty-sdk/define';

import { applyLinkedPayment } from 'src/utils/apply-linked-payment.util';

// A membership created with a payment takes over that payment's status at once.
const handler = async (event: DatabaseEventPayload<ObjectRecordCreateEvent<{ paymentId?: string | null }>>) =>
  applyLinkedPayment('memberships', event.recordId, event.properties.after?.paymentId);

export default defineLogicFunction({
  universalIdentifier: '8d308881-23df-4bc4-b51b-81d8c8e61f16',
  name: 'on-membership-payment-created',
  description: 'Gives a membership created with a payment that payment\'s status',
  timeoutSeconds: 20,
  handler,
  databaseEventTriggerSettings: { eventName: 'membership.created' },
});
