import { describe, expect, it } from 'vitest';

import consentObject from 'src/objects/consent';
import consentChangeObject from 'src/objects/consent-change';
import emailTypeObject from 'src/objects/email-type';

const fieldNames = (object: { config: { fields?: Array<{ name: string }> } }) =>
  (object.config.fields ?? []).map((field) => field.name);

const optionValues = (object: { config: { fields?: Array<{ name: string; options?: unknown }> } }, name: string) =>
  ((object.config.fields ?? []).find((field) => field.name === name)?.options as Array<{ value: string }>).map(
    (option) => option.value,
  );

describe('data model', () => {
  it('defines the email type fields', () => {
    expect(emailTypeObject.config.nameSingular).toBe('emailType');
    expect(fieldNames(emailTypeObject)).toEqual(
      expect.arrayContaining(['name', 'description', 'consentText', 'isActive', 'consents', 'messageLists']),
    );
  });

  it('defines the consent fields and statuses', () => {
    expect(fieldNames(consentObject)).toEqual(
      expect.arrayContaining([
        'name', 'person', 'emailType', 'status', 'grantedAt', 'withdrawnAt', 'confirmationUrl', 'confirmationSentAt', 'changes',
      ]),
    );
    expect(optionValues(consentObject, 'status')).toEqual(['PENDING', 'GRANTED', 'WITHDRAWN']);
  });

  it('defines the consent change fields, actions and sources', () => {
    expect(fieldNames(consentChangeObject)).toEqual(
      expect.arrayContaining([
        'consent', 'action', 'source', 'occurredAt', 'shownText', 'formName', 'submissionId', 'ipAddress', 'userAgent', 'language', 'note',
      ]),
    );
    expect(optionValues(consentChangeObject, 'action')).toEqual(['REQUESTED', 'CONFIRMED', 'GRANTED', 'WITHDRAWN']);
    expect(optionValues(consentChangeObject, 'source')).toEqual(['FORM', 'PREFERENCE_PAGE', 'MANUAL', 'IMPORT', 'API', 'BREVO']);
  });
});
