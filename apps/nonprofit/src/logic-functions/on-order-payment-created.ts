import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordCreateEvent } from 'twenty-sdk/define';

import { applyLinkedPayment } from 'src/utils/apply-linked-payment.util';

// A order created with a payment takes over that payment's status at once.
const handler = async (event: DatabaseEventPayload<ObjectRecordCreateEvent<{ paymentId?: string | null }>>) =>
  applyLinkedPayment('orders', event.recordId, event.properties.after?.paymentId);

export default defineLogicFunction({
  universalIdentifier: '9b6ee016-8d57-4132-aec9-51655235ec71',
  name: 'on-order-payment-created',
  description: 'Gives a order created with a payment that payment\'s status',
  timeoutSeconds: 20,
  handler,
  databaseEventTriggerSettings: { eventName: 'order.created' },
});
