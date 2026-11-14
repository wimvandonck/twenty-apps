import { describe, expect, it } from 'vitest';

import { getPublicMessages } from 'src/utils/get-public-messages.util';
import { renderConfirmationEmail } from 'src/utils/render-confirmation-email.util';

const input = {
  firstName: 'Ann',
  organizationName: 'Vzw Groen',
  emailTypeNames: ['Nieuwsbrief', 'Uitnodigingen'],
  confirmationUrl: 'https://x.test/s/consents/confirm?token=abc.def',
  locale: 'nl' as const,
};

describe('renderConfirmationEmail', () => {
  it('names every email type and links to the confirmation', () => {
    const email = renderConfirmationEmail(input);

    for (const part of [email.html, email.text]) {
      expect(part).toContain('Nieuwsbrief');
      expect(part).toContain('Uitnodigingen');
      expect(part).toContain('https://x.test/s/consents/confirm?token=abc.def');
    }
    expect(email.subject).toContain('Vzw Groen');
  });

  it('escapes names in the HTML', () => {
    const email = renderConfirmationEmail({ ...input, firstName: '<b>Ann & co</b>' });

    expect(email.html).toContain('&lt;b&gt;Ann &amp; co&lt;/b&gt;');
    expect(email.html).not.toContain('<b>Ann');
  });

  it('writes French and falls back to English', () => {
    const french = renderConfirmationEmail({ ...input, locale: 'fr' });
    const english = renderConfirmationEmail({ ...input, locale: 'en' });

    expect(french.subject).not.toBe(english.subject);
    expect(renderConfirmationEmail(input).subject).not.toBe(english.subject);
  });
});

describe('getPublicMessages', () => {
  it('follows the requested language, then the browser, then English', () => {
    expect(getPublicMessages('fr-BE', undefined).locale).toBe('fr');
    expect(getPublicMessages(undefined, 'nl-BE,nl;q=0.9,en;q=0.8').locale).toBe('nl');
    expect(getPublicMessages('de', 'de-DE').locale).toBe('en');
    expect(getPublicMessages(undefined, undefined).locale).toBe('en');
  });
});
