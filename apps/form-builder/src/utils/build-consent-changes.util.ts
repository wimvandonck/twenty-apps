import { type ConsentChangeRequest } from 'src/types/consent-api';
import { type FormDefinition } from 'src/types/form-definition';
import { type SubmissionOptIns } from 'src/types/submission-values';

// The consents to request per person record: every ticked consent box, and
// the email type of every ticked list that requires one, once per type.
export const buildConsentChanges = (
  definition: FormDefinition,
  consents: SubmissionOptIns,
  optIns: SubmissionOptIns,
  language?: string,
): Map<string, ConsentChangeRequest[]> => {
  const byRecord = new Map<string, ConsentChangeRequest[]>();
  const add = (recordKey: string, emailTypeId: string, shownText: string) => {
    const changes = byRecord.get(recordKey) ?? [];

    if (!changes.some((change) => change.emailTypeId === emailTypeId)) {
      changes.push({
        emailTypeId,
        action: 'REQUESTED',
        source: 'FORM',
        shownText,
        ...(definition.title ? { formName: definition.title } : {}),
        ...(language ? { language } : {}),
      });
      byRecord.set(recordKey, changes);
    }
  };

  for (const consent of definition.consents) {
    if (consents[consent.key] === true) {
      add(consent.recordKey, consent.emailTypeId, consent.label);
    }
  }

  for (const list of definition.lists) {
    if (list.optIn && list.emailTypeId && optIns[list.key] === true) {
      add(list.recordKey, list.emailTypeId, list.label);
    }
  }

  return byRecord;
};
