import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordCreateEvent } from 'twenty-sdk/define';

import { ON_SEGMENT_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { createTwentyApi } from 'src/twenty-client/create-twenty-api';
import { recalculateSegment } from 'src/utils/recalculate-segment.util';

// A new segment is calculated right away.
const handler = async (event: DatabaseEventPayload<ObjectRecordCreateEvent<{ id: string }>>) =>
  recalculateSegment(createTwentyApi(), event.recordId);

export default defineLogicFunction({
  universalIdentifier: ON_SEGMENT_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-segment-created',
  description: 'Calculates a new segment',
  timeoutSeconds: 300,
  handler,
  databaseEventTriggerSettings: { eventName: 'segment.created' },
});
