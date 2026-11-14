import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordUpdateEvent } from 'twenty-sdk/define';

import { applyLinkedPayment } from 'src/utils/apply-linked-payment.util';

// A order linked to a payment takes over that payment's status at once.
const handler = async (event: DatabaseEventPayload<ObjectRecordUpdateEvent<{ paymentId?: string | null }>>) =>
  applyLinkedPayment('orders', event.recordId, event.properties.after?.paymentId);

export default defineLogicFunction({
  universalIdentifier: '76e5ca1b-76a0-4799-bbf5-95c022846fb1',
  name: 'on-order-payment-linked',
  description: 'Gives a order linked to a payment that payment\'s status',
  timeoutSeconds: 20,
  handler,
  databaseEventTriggerSettings: { eventName: 'order.updated', updatedFields: ['paymentId'] },
});
