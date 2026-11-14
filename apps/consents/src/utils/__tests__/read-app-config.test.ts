import { describe, expect, it } from 'vitest';

import { readAppConfig } from 'src/utils/read-app-config.util';

describe('readAppConfig', () => {
  it('uses the public functions address for links', () => {
    expect(
      readAppConfig({
        CONSENT_SIGNING_SECRET: 's',
        TWENTY_API_URL: 'https://api.twenty.com',
        TWENTY_FUNCTIONS_URL: 'https://acme.withtwenty.com/',
      }).publicBaseUrl,
    ).toBe('https://acme.withtwenty.com');
  });

  it('falls back to the API address', () => {
    expect(readAppConfig({ CONSENT_SIGNING_SECRET: 's', TWENTY_API_URL: 'https://crm.example.org' }).publicBaseUrl).toBe(
      'https://crm.example.org',
    );
  });

  it('refuses to run without a signing secret', () => {
    expect(() => readAppConfig({ TWENTY_API_URL: 'https://x' })).toThrow(/CONSENT_SIGNING_SECRET/);
  });

  it('falls back to the sender name for the organization', () => {
    expect(readAppConfig({ CONSENT_SIGNING_SECRET: 's', SENDER_NAME: 'Vzw Groen' }).organizationName).toBe('Vzw Groen');
  });

  it('treats an empty Brevo key as none', () => {
    expect(readAppConfig({ CONSENT_SIGNING_SECRET: 's', BREVO_API_KEY: ' ' }).brevoApiKey).toBeNull();
  });
});
