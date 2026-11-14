import { type TwentyApi } from 'src/twenty-client/create-twenty-api';
import { applyConsent } from 'src/utils/apply-consent.util';
import { computeListChanges } from 'src/utils/compute-list-changes.util';
import { evaluateDefinition } from 'src/utils/evaluate-definition.util';
import { parseDefinition } from 'src/utils/parse-definition.util';

export type RecalculateResult = {
  segmentId: string;
  matched?: number;
  added?: number;
  removed?: number;
  skipped?: number;
  error?: string;
};

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

    const requiredEmailTypeId = await api.fetchRequiredEmailTypeId(segment.listId);
    const consent = applyConsent(
      changes.add,
      requiredEmailTypeId ? await api.fetchConsentedPersonIds(requiredEmailTypeId) : null,
    );

    for (const personId of consent.add) {
      await api.addListMember(segment.listId, personId);
    }

    for (const personId of changes.remove) {
      const memberId = memberIdsByPerson.get(personId);

      if (memberId) {
        await api.removeListMember(memberId);
      }
    }

    // People skipped for lack of consent are not remembered as matched, so
    // they join once they give consent.
    const skipped = new Set(consent.skipped);
    const skippedText = skipped.size > 0 ? `, ${skipped.size} skipped without consent` : '';

    await api.updateSegment(segment.id, {
      memberCount: matched.size,
      lastCalculatedAt: now.toISOString(),
      lastResult: `${consent.add.length} joined, ${changes.remove.length} left${skippedText}`,
      matchedPersonIds: [...matched].filter((id) => !skipped.has(id)).sort(),
    });

    return {
      segmentId,
      matched: matched.size,
      added: consent.add.length,
      removed: changes.remove.length,
      skipped: skipped.size,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await api.updateSegment(segment.id, { lastCalculatedAt: now.toISOString(), lastResult: `Error: ${message}` });

    return { segmentId, error: message };
  }
};
