import { type FormDefinition } from 'src/types/form-definition';
import { type PublicFormMessages } from 'src/types/public-form-messages';
import { type RecordApi } from 'src/types/record-api';
import { type SubmissionResult } from 'src/types/submission-result';
import { type SubmissionValues } from 'src/types/submission-values';
import { buildMatchFilter } from 'src/utils/build-match-filter.util';
import { buildRecordData } from 'src/utils/build-record-data.util';
import { sortRecordsByLinks } from 'src/utils/sort-records-by-links.util';

// Validates a whole submission first, then writes the records in link order
// and the junction records that connect them. If a write fails, the records
// this submission created are removed again.
export const processSubmission = async (
  definition: FormDefinition,
  values: SubmissionValues,
  api: RecordApi,
  messages: PublicFormMessages,
): Promise<SubmissionResult> => {
  const orderedRecords = sortRecordsByLinks(definition.records, definition.links);

  if (orderedRecords === null) {
    return { ok: false, status: 500, errors: [messages.misconfigured] };
  }

  const built = orderedRecords.map((record) => ({
    record,
    ...buildRecordData(record, values[record.key] ?? {}, messages),
  }));
  const errors = built.flatMap((entry) => entry.errors);

  if (errors.length > 0) {
    return { ok: false, status: 422, errors };
  }

  const recordIds = new Map<string, string>();
  const createdKeys = new Set<string>();
  const created: Array<{ objectNamePlural: string; id: string }> = [];

  try {
    for (const { record, data } of built) {
      for (const link of definition.links) {
        const targetId = recordIds.get(link.targetRecordKey);

        if (link.kind === 'DIRECT' && link.sourceRecordKey === record.key && targetId !== undefined) {
          data[link.joinColumnName] = targetId;
        }
      }

      const filter = buildMatchFilter(record, data);
      const existingId =
        filter === null ? null : await api.findIdByFilter(record.objectNamePlural, filter);

      if (existingId !== null) {
        await api.update(record.objectNamePlural, existingId, data);
        recordIds.set(record.key, existingId);
      } else {
        const id = await api.create(record.objectNamePlural, data);

        recordIds.set(record.key, id);
        createdKeys.add(record.key);
        created.push({ objectNamePlural: record.objectNamePlural, id });
      }
    }

    for (const link of definition.links) {
      if (link.kind !== 'JUNCTION') {
        continue;
      }

      const sourceId = recordIds.get(link.sourceRecordKey) as string;
      const targetId = recordIds.get(link.targetRecordKey) as string;
      // Two records that both existed already may be connected already.
      const isMaybeConnected =
        !createdKeys.has(link.sourceRecordKey) && !createdKeys.has(link.targetRecordKey);
      const existingId = isMaybeConnected
        ? await api.findIdByFilter(
            link.junctionObjectNamePlural,
            `and(${link.sourceJoinColumnName}[eq]:"${sourceId}",${link.targetJoinColumnName}[eq]:"${targetId}")`,
          )
        : null;

      if (existingId === null) {
        const id = await api.create(link.junctionObjectNamePlural, {
          [link.sourceJoinColumnName]: sourceId,
          [link.targetJoinColumnName]: targetId,
        });

        created.push({ objectNamePlural: link.junctionObjectNamePlural, id });
      }
    }
  } catch (error) {
    console.error('Form submission failed', error);

    for (const { objectNamePlural, id } of created.reverse()) {
      await api.remove(objectNamePlural, id).catch(() => undefined);
    }

    return { ok: false, status: 500, errors: [messages.genericError] };
  }

  return { ok: true };
};
