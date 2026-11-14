import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  PAYMENT_METHODS_VARIABLE_UNIVERSAL_IDENTIFIER,
  STRIPE_SECRET_KEY_VARIABLE_UNIVERSAL_IDENTIFIER,
  STRIPE_WEBHOOK_SECRET_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  applicationVariables: {
    STRIPE_SECRET_KEY: {
      universalIdentifier: STRIPE_SECRET_KEY_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Stripe secret key',
      description: 'The secret key of your Stripe account (sk_test_… to try, sk_live_… for real payments).',
      isSecret: true,
      isRequired: true,
    },
    STRIPE_WEBHOOK_SECRET: {
      universalIdentifier: STRIPE_WEBHOOK_SECRET_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Stripe webhook signing secret',
      description: 'The signing secret (whsec_…) of the webhook endpoint you add in Stripe for this app.',
      isSecret: true,
      isRequired: true,
    },
    PAYMENT_METHODS: {
      universalIdentifier: PAYMENT_METHODS_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Payment methods',
      description: 'Stripe payment method types, separated by commas. Leave empty to use the methods enabled in your Stripe dashboard.',
      value: '',
    },
  },
});
