import { type FormDefinition } from 'src/types/form-definition';
import { type RecordApi } from 'src/types/record-api';
import { type SubmissionResult } from 'src/types/submission-result';
import { type SubmissionValues } from 'src/types/submission-values';
import { buildMatchFilter } from 'src/utils/build-match-filter.util';
import { buildRecordData } from 'src/utils/build-record-data.util';
import { sortRecordsByLinks } from 'src/utils/sort-records-by-links.util';

// Validates a whole submission first, then writes the records in link order.
// If a write fails, the records this submission created are removed again.
export const processSubmission = async (
  definition: FormDefinition,
  values: SubmissionValues,
  api: RecordApi,
): Promise<SubmissionResult> => {
  const orderedRecords = sortRecordsByLinks(definition.records, definition.links);

  if (orderedRecords === null) {
    return { ok: false, status: 500, errors: ['This form is misconfigured.'] };
  }

  const built = orderedRecords.map((record) => ({
    record,
    ...buildRecordData(record, values[record.key] ?? {}),
  }));
  const errors = built.flatMap((entry) => entry.errors);

  if (errors.length > 0) {
    return { ok: false, status: 422, errors };
  }

  const recordIds = new Map<string, string>();
  const created: Array<{ objectNamePlural: string; id: string }> = [];

  try {
    for (const { record, data } of built) {
      for (const link of definition.links) {
        const targetId = recordIds.get(link.targetRecordKey);

        if (link.sourceRecordKey === record.key && targetId !== undefined) {
          data[link.joinColumnName] = targetId;
        }
      }

      const filter = buildMatchFilter(record, data);
      const existingId =
        filter === null
          ? null
          : await api.findIdByFilter(record.objectNamePlural, filter);

      if (existingId !== null) {
        await api.update(record.objectNamePlural, existingId, data);
        recordIds.set(record.key, existingId);
      } else {
        const id = await api.create(record.objectNamePlural, data);

        recordIds.set(record.key, id);
        created.push({ objectNamePlural: record.objectNamePlural, id });
      }
    }
  } catch (error) {
    console.error('Form submission failed', error);

    for (const { objectNamePlural, id } of created.reverse()) {
      await api.remove(objectNamePlural, id).catch(() => undefined);
    }

    return {
      ok: false,
      status: 500,
      errors: ['Something went wrong. Please try again.'],
    };
  }

  return { ok: true };
};
