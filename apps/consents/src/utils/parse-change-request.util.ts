import { type ChangeRequest } from 'src/types/change-request';

const ACTIONS = ['REQUESTED', 'CONFIRMED', 'GRANTED', 'WITHDRAWN'];
const SOURCES = ['FORM', 'PREFERENCE_PAGE', 'MANUAL', 'IMPORT', 'API', 'BREVO'];
const OPTIONAL_TEXT = ['occurredAt', 'shownText', 'formName', 'language', 'note'] as const;

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim() !== '';

// Checks the body of POST /consents/changes.
export const parseChangeRequest = (
  body: unknown,
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

    for (const key of OPTIONAL_TEXT) {
      if (isText(change[key])) {
        parsed[key] = change[key];
      }
    }

    return parsed as ChangeRequest['changes'][number];
  });

  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: { personId: input.personId as string, changes } };
};
