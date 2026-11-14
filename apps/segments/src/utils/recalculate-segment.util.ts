import { type TwentyApi } from 'src/twenty-client/create-twenty-api';
import { computeListChanges } from 'src/utils/compute-list-changes.util';
import { evaluateDefinition } from 'src/utils/evaluate-definition.util';
import { parseDefinition } from 'src/utils/parse-definition.util';

export type RecalculateResult = { segmentId: string; matched?: number; added?: number; removed?: number; error?: string };

const toIdSet = (value: unknown): Set<string> =>
  new Set(Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []);

// Calculates one segment and brings its list up to date.
export const recalculateSegment = async (
  api: TwentyApi,
  segmentId: string,
  now: Date = new Date(),
): Promise<RecalculateResult> => {
  const segment = await api.fetchSegment(segmentId);

  if (!segment) {
    return { segmentId, error: 'Segment not found' };
  }

  try {
    if (!segment.listId) {
      throw new Error('Choose the list the members are kept in');
    }

    const definition = parseDefinition(segment.definition);
    const matched = await evaluateDefinition(definition, api.deps, now);
    const members = await api.fetchListMembers(segment.listId);
    const memberIdsByPerson = new Map(members.map((member) => [member.personId, member.id]));

    const changes = computeListChanges(
      matched,
      toIdSet(segment.matchedPersonIds),
      new Set(memberIdsByPerson.keys()),
      segment.mode === 'STATIC',
    );

    for (const personId of changes.add) {
      await api.addListMember(segment.listId, personId);
    }

    for (const personId of changes.remove) {
      const memberId = memberIdsByPerson.get(personId);

      if (memberId) {
        await api.removeListMember(memberId);
      }
    }

    await api.updateSegment(segment.id, {
      memberCount: matched.size,
      lastCalculatedAt: now.toISOString(),
      lastResult: `${changes.add.length} joined, ${changes.remove.length} left`,
      matchedPersonIds: [...matched].sort(),
    });

    return { segmentId, matched: matched.size, added: changes.add.length, removed: changes.remove.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await api.updateSegment(segment.id, { lastCalculatedAt: now.toISOString(), lastResult: `Error: ${message}` });

    return { segmentId, error: message };
  }
};
