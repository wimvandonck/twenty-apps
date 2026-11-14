import { describe, expect, it } from 'vitest';

import applicationConfig from 'src/application-config';

describe('application config', () => {
  it('declares the Brevo key and the webhook token as required secrets', () => {
    const variables = applicationConfig.config.applicationVariables ?? {};

    expect(variables.BREVO_API_KEY).toMatchObject({ isSecret: true, isRequired: true });
    expect(variables.BREVO_WEBHOOK_TOKEN).toMatchObject({ isSecret: true, isRequired: true });
    expect(variables.BREVO_FOLDER_NAME).toMatchObject({ value: 'Twenty' });
  });
});
