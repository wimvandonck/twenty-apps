import { describe, expect, it } from 'vitest';

import { buildContactUpsert } from 'src/utils/build-contact-upsert.util';
import { chunk } from 'src/utils/chunk.util';
import { consentAttributeName } from 'src/utils/consent-attribute-name.util';
import { isValidWebhookToken } from 'src/utils/is-valid-webhook-token.util';
import { parseUnsubscribe } from 'src/utils/parse-unsubscribe.util';

describe('consentAttributeName', () => {
  it('turns an email type into a Brevo attribute name', () => {
    expect(consentAttributeName('Nieuwsbrief')).toBe('CONSENT_NIEUWSBRIEF');
    expect(consentAttributeName('Uitnodigingen évènementen & acties!')).toBe('CONSENT_UITNODIGINGEN_EVENEMENTEN_ACTIES');
    expect(consentAttributeName('   ')).toBe('CONSENT_EMAIL_TYPE');
  });
});

describe('buildContactUpsert', () => {
  it('describes the contact with names, consents and lists, and updates an existing one', () => {
    expect(
      buildContactUpsert({
        email: ' Ann@Example.org ',
        firstName: 'Ann',
        lastName: 'Peeters',
        consents: { CONSENT_NIEUWSBRIEF: true },
        listIds: [7],
      }),
    ).toEqual({
      email: 'ann@example.org',
      attributes: { FIRSTNAME: 'Ann', LASTNAME: 'Peeters', CONSENT_NIEUWSBRIEF: true },
      listIds: [7],
      updateEnabled: true,
    });
  });

  it('leaves out empty names and lists', () => {
    expect(buildContactUpsert({ email: 'a@b.c', firstName: '', lastName: '', consents: {}, listIds: [] })).toEqual({
      email: 'a@b.c',
      attributes: {},
      updateEnabled: true,
    });
  });
});

describe('chunk', () => {
  it('splits a list into parts', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunk([], 2)).toEqual([]);
  });
});

describe('parseUnsubscribe', () => {
  it('reads the email and lists of an unsubscribe event', () => {
    expect(parseUnsubscribe({ event: 'unsubscribe', email: 'Ann@Example.org', list_id: [3, 42] })).toEqual({
      email: 'ann@example.org',
      listIds: [3, 42],
    });
  });

  it('ignores other events and events without an email', () => {
    expect(parseUnsubscribe({ event: 'opened', email: 'a@b.c' })).toBeNull();
    expect(parseUnsubscribe({ event: 'unsubscribe' })).toBeNull();
    expect(parseUnsubscribe(null)).toBeNull();
  });
});

describe('isValidWebhookToken', () => {
  it('accepts only the configured token', () => {
    expect(isValidWebhookToken('secret-token', 'secret-token')).toBe(true);
    expect(isValidWebhookToken('secret-tokeN', 'secret-token')).toBe(false);
    expect(isValidWebhookToken(undefined, 'secret-token')).toBe(false);
    expect(isValidWebhookToken('x', null)).toBe(false);
  });
});
