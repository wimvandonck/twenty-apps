import { describe, expect, it } from 'vitest';

import applicationConfig from 'src/application-config';

describe('application config', () => {
  it('declares the Stripe keys as required secrets', () => {
    const variables = applicationConfig.config.applicationVariables ?? {};

    expect(variables.STRIPE_SECRET_KEY).toMatchObject({ isSecret: true, isRequired: true });
    expect(variables.STRIPE_WEBHOOK_SECRET).toMatchObject({ isSecret: true, isRequired: true });
    expect(variables.PAYMENT_METHODS?.isSecret).not.toBe(true);
  });
});
