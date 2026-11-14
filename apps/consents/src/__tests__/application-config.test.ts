import { describe, expect, it } from 'vitest';

import applicationConfig from 'src/application-config';
import { APP_DISPLAY_NAME } from 'src/constants/universal-identifiers';

describe('application config', () => {
  const config = applicationConfig.config;
  const variables = config.applicationVariables ?? {};

  it('is called Consents', () => {
    expect(APP_DISPLAY_NAME).toBe('Consents');
    expect(config.displayName).toBe('Consents');
  });

  it('declares the signing secret as a required secret', () => {
    expect(variables.CONSENT_SIGNING_SECRET).toMatchObject({ isSecret: true, isRequired: true });
  });

  it('declares the Brevo API key as an optional secret', () => {
    expect(variables.BREVO_API_KEY).toMatchObject({ isSecret: true });
    expect(variables.BREVO_API_KEY?.isRequired).not.toBe(true);
  });

  it('requires the organization name, which the mail and pages use', () => {
    expect(variables.ORGANIZATION_NAME).toMatchObject({ isRequired: true });
  });

  it('declares the sender and organization settings', () => {
    expect(Object.keys(variables).sort()).toEqual(
      ['BREVO_API_KEY', 'CONSENT_SIGNING_SECRET', 'ORGANIZATION_NAME', 'SENDER_EMAIL', 'SENDER_NAME'].sort(),
    );
  });
});
