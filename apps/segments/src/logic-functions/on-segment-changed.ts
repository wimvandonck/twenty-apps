import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordUpdateEvent } from 'twenty-sdk/define';

import { ON_SEGMENT_CHANGED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { createTwentyApi } from 'src/twenty-client/create-twenty-api';
import { recalculateSegment } from 'src/utils/recalculate-segment.util';

// Changing the conditions, the type or the list recalculates the segment.
// The app's own updates to the results do not trigger this.
const handler = async (event: DatabaseEventPayload<ObjectRecordUpdateEvent<{ id: string }>>) =>
  recalculateSegment(createTwentyApi(), event.recordId);

export default defineLogicFunction({
  universalIdentifier: ON_SEGMENT_CHANGED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-segment-changed',
  description: 'Recalculates a segment when its conditions, type or list change',
  timeoutSeconds: 300,
  handler,
  databaseEventTriggerSettings: { eventName: 'segment.updated', updatedFields: ['definition', 'mode', 'listId'] },
});
