import {
  LIST_MEMBER_LIST_JOIN_COLUMN,
  LIST_MEMBER_OBJECT_NAME_PLURAL,
  LIST_MEMBER_PERSON_JOIN_COLUMN,
} from 'src/constants/list-objects';
import { PAYMENT_OBJECT_NAME_PLURAL } from 'src/constants/payment-object';
import { type ConsentApi } from 'src/types/consent-api';
import { type FormDefinition } from 'src/types/form-definition';
import { type PublicFormMessages } from 'src/types/public-form-messages';
import { type RecordApi } from 'src/types/record-api';
import { type SubmissionResult } from 'src/types/submission-result';
import { type SubmissionOptIns, type SubmissionValues } from 'src/types/submission-values';
import { type PickerChoice } from 'src/types/picker-choice';
import { buildConsentChanges } from 'src/utils/build-consent-changes.util';
import { buildPickerLines, MAX_LINES_PER_SUBMISSION } from 'src/utils/build-picker-lines.util';
import { computeTotal } from 'src/utils/compute-total.util';
import { buildMatchFilter } from 'src/utils/build-match-filter.util';
import { buildRecordData } from 'src/utils/build-record-data.util';
import { sortRecordsByLinks } from 'src/utils/sort-records-by-links.util';

export type SubmissionOptions = {
  // Records consents; without it, consent boxes are ignored.
  consentApi?: ConsentApi;
  // The consent boxes the visitor ticked: consent key -> true.
  consents?: SubmissionOptIns;
  language?: string;
  visitor?: { ipAddress?: string; userAgent?: string };
  // The records each picker offers now, loaded from Twenty.
  pickerChoices?: Map<string, PickerChoice[]>;
  // What the visitor chose per picker: choice id -> quantity.
  picks?: Record<string, Record<string, unknown>>;
};

// Validates a whole submission first, then writes the records in link order,
// the junction records that connect them, the list memberships and the
// consents. If a write fails, the records this submission created are
// removed again.
export const processSubmission = async (
  definition: FormDefinition,
  values: SubmissionValues,
  api: RecordApi,
  messages: PublicFormMessages,
  optIns: SubmissionOptIns = {},
  options: SubmissionOptions = {},
): Promise<SubmissionResult> => {
  const consents = options.consents ?? {};
  const orderedRecords = sortRecordsByLinks(definition.records, definition.links);

  if (orderedRecords === null) {
    return { ok: false, status: 500, errors: [messages.misconfigured] };
  }

  const built = orderedRecords.map((record) => ({
    record,
    ...buildRecordData(record, values[record.key] ?? {}, messages),
  }));
  const currencyCode = definition.payment?.currencyCode ?? 'EUR';
  const pickerLines = definition.pickers.map((picker) => ({
    picker,
    ...buildPickerLines(
      picker,
      options.pickerChoices?.get(picker.key) ?? [],
      options.picks?.[picker.key] ?? {},
      messages,
      currencyCode,
    ),
  }));
  const pickersMicros = pickerLines.reduce((sum, { totalMicros }) => sum + totalMicros, 0);
  const total = definition.payment
    ? computeTotal(
        definition.payment,
        Object.fromEntries(built.map(({ record, data }) => [record.key, data])),
        pickersMicros,
        messages,
      )
    : { totalMicros: pickersMicros, errors: [] };
  const errors = [
    ...built.flatMap((entry) => entry.errors),
    ...pickerLines.flatMap((entry) => entry.errors),
    ...total.errors,
    ...(pickerLines.reduce((sum, { lines }) => sum + lines.length, 0) > MAX_LINES_PER_SUBMISSION
      ? [messages.tooMany.replace('{max}', String(MAX_LINES_PER_SUBMISSION))]
      : []),
    ...definition.consents
      .filter((consent) => consent.required && consents[consent.key] !== true)
      .map((consent) => messages.required.replace('{label}', consent.label)),
  ];

  if (errors.length > 0) {
    return { ok: false, status: 422, errors };
  }

  for (const { recordKey, fieldName } of definition.payment?.totalFields ?? []) {
    const entry = built.find(({ record }) => record.key === recordKey);

    if (entry) {
      entry.data[fieldName] = { amountMicros: total.totalMicros, currencyCode };
    }
  }

  const recordIds = new Map<string, string>();
  const lineIds = new Map<string, string[]>();
  let paymentId: string | undefined;
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

    for (const { picker, lines } of pickerLines) {
      const ids: string[] = [];

      for (const line of lines) {
        const data = { ...line };

        for (const link of picker.line.links) {
          data[link.joinColumnName] = recordIds.get(link.recordKey);
        }

        const id = await api.create(picker.line.objectNamePlural, data);

        ids.push(id);
        created.push({ objectNamePlural: picker.line.objectNamePlural, id });
      }

      lineIds.set(picker.key, ids);
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

    for (const list of definition.lists) {
      const personId = recordIds.get(list.recordKey);

      if (personId === undefined || (list.optIn && optIns[list.key] !== true)) {
        continue;
      }

      // A person who existed already may be on the list already.
      const existingId = createdKeys.has(list.recordKey)
        ? null
        : await api.findIdByFilter(
            LIST_MEMBER_OBJECT_NAME_PLURAL,
            `and(${LIST_MEMBER_LIST_JOIN_COLUMN}[eq]:"${list.listId}",${LIST_MEMBER_PERSON_JOIN_COLUMN}[eq]:"${personId}")`,
          );

      if (existingId === null) {
        const id = await api.create(LIST_MEMBER_OBJECT_NAME_PLURAL, {
          [LIST_MEMBER_LIST_JOIN_COLUMN]: list.listId,
          [LIST_MEMBER_PERSON_JOIN_COLUMN]: personId,
        });

        created.push({ objectNamePlural: LIST_MEMBER_OBJECT_NAME_PLURAL, id });
      }
    }

    if (definition.payment?.createPayment && total.totalMicros > 0) {
      const payerId = definition.payment.payerRecordKey ? recordIds.get(definition.payment.payerRecordKey) : undefined;

      paymentId = await api.create(PAYMENT_OBJECT_NAME_PLURAL, {
        name: definition.title || 'Form payment',
        amount: { amountMicros: total.totalMicros, currencyCode },
        status: 'OPEN',
        ...(payerId ? { payerId } : {}),
      });
      created.push({ objectNamePlural: PAYMENT_OBJECT_NAME_PLURAL, id: paymentId });

      for (const link of definition.payment.paymentLinks) {
        if (link.recordKey) {
          const record = definition.records.find(({ key }) => key === link.recordKey);
          const id = recordIds.get(link.recordKey);

          if (record && id) {
            await api.update(record.objectNamePlural, id, { [link.joinColumnName]: paymentId });
          }
        }

        if (link.pickerKey) {
          const picker = definition.pickers.find(({ key }) => key === link.pickerKey);

          for (const id of lineIds.get(link.pickerKey) ?? []) {
            await api.update(picker?.line.objectNamePlural ?? '', id, { [link.joinColumnName]: paymentId });
          }
        }
      }
    }

    if (options.consentApi) {
      for (const [recordKey, changes] of buildConsentChanges(definition, consents, optIns, options.language)) {
        const personId = recordIds.get(recordKey);

        if (personId !== undefined) {
          await options.consentApi.record({ personId, changes, ...options.visitor });
        }
      }
    }
  } catch (error) {
    console.error('Form submission failed', error);

    for (const { objectNamePlural, id } of created.reverse()) {
      await api.remove(objectNamePlural, id).catch(() => undefined);
    }

    return { ok: false, status: 500, errors: [messages.genericError] };
  }

  return paymentId ? { ok: true, paymentId, totalMicros: total.totalMicros } : { ok: true };
};
