import { defineLogicFunction } from 'twenty-sdk/define';

import { RECALCULATE_SEGMENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { createTwentyApi } from 'src/twenty-client/create-twenty-api';
import { recalculateSegment, type RecalculateResult } from 'src/utils/recalculate-segment.util';

// Keeps every dynamic segment's list up to date.
const handler = async () => {
  const api = createTwentyApi();
  const results: RecalculateResult[] = [];

  for (const segmentId of await api.fetchDynamicSegmentIds()) {
    results.push(await recalculateSegment(api, segmentId));
  }

  return { results };
};

export default defineLogicFunction({
  universalIdentifier: RECALCULATE_SEGMENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'recalculate-segments',
  description: 'Recalculates every dynamic segment and updates its list',
  timeoutSeconds: 300,
  handler,
  cronTriggerSettings: { pattern: '*/15 * * * *' },
});
