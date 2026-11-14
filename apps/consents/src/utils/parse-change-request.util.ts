import { type ChangeRequest } from 'src/types/change-request';

const ACTIONS = ['REQUESTED', 'CONFIRMED', 'GRANTED', 'WITHDRAWN'];
const SOURCES = ['FORM', 'PREFERENCE_PAGE', 'MANUAL', 'IMPORT', 'API', 'BREVO'];
const OPTIONAL_TEXT = ['shownText', 'formName', 'language', 'note'] as const;
// A little slack for clocks that run ahead.
const FUTURE_SLACK_MS = 5 * 60 * 1000;

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim() !== '';

// Checks the body of POST /consents/changes.
export const parseChangeRequest = (
  body: unknown,
  now: number = Date.now(),
): { ok: true; value: ChangeRequest } | { ok: false; errors: string[] } => {
  const input = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  const errors: string[] = [];

  if (!isText(input.personId)) {
    errors.push('personId is required');
  }

  if (!Array.isArray(input.changes) || input.changes.length === 0) {
    errors.push('changes must hold at least one change');
  }

  const changes = (Array.isArray(input.changes) ? input.changes : []).map((raw, index) => {
    const change = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;

    if (!isText(change.emailTypeId)) {
      errors.push(`changes[${index}].emailTypeId is required`);
    }

    if (!ACTIONS.includes(change.action as string)) {
      errors.push(`changes[${index}].action must be one of ${ACTIONS.join(', ')}`);
    }

    if (!SOURCES.includes(change.source as string)) {
      errors.push(`changes[${index}].source must be one of ${SOURCES.join(', ')}`);
    }

    const parsed: Record<string, unknown> = { emailTypeId: change.emailTypeId, action: change.action, source: change.source };

    if (isText(change.occurredAt)) {
      const time = Date.parse(change.occurredAt);

      if (Number.isNaN(time) || time > now + FUTURE_SLACK_MS) {
        errors.push(`changes[${index}].occurredAt must be a date and time in the past`);
      } else {
        parsed.occurredAt = new Date(time).toISOString();
      }
    }

    for (const key of OPTIONAL_TEXT) {
      if (isText(change[key])) {
        parsed[key] = change[key];
      }
    }

    return parsed as ChangeRequest['changes'][number];
  });

  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: { personId: input.personId as string, changes } };
};
