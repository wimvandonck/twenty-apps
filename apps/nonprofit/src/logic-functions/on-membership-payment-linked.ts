import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordUpdateEvent } from 'twenty-sdk/define';

import { applyLinkedPayment } from 'src/utils/apply-linked-payment.util';

// A membership linked to a payment takes over that payment's status at once.
const handler = async (event: DatabaseEventPayload<ObjectRecordUpdateEvent<{ paymentId?: string | null }>>) =>
  applyLinkedPayment('memberships', event.recordId, event.properties.after?.paymentId);

export default defineLogicFunction({
  universalIdentifier: '587a0f2c-e346-45aa-8232-9a854e202b59',
  name: 'on-membership-payment-linked',
  description: 'Gives a membership linked to a payment that payment\'s status',
  timeoutSeconds: 20,
  handler,
  databaseEventTriggerSettings: { eventName: 'membership.updated', updatedFields: ['paymentId'] },
});
