import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  BREVO_API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER,
  BREVO_FOLDER_NAME_VARIABLE_UNIVERSAL_IDENTIFIER,
  BREVO_WEBHOOK_TOKEN_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  applicationVariables: {
    BREVO_API_KEY: {
      universalIdentifier: BREVO_API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Brevo API key',
      description: 'An API key of your Brevo account (SMTP & API → API keys).',
      isSecret: true,
      isRequired: true,
    },
    BREVO_WEBHOOK_TOKEN: {
      universalIdentifier: BREVO_WEBHOOK_TOKEN_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Webhook token',
      description: 'A long random string. Put it in the address of the unsubscribe webhook you add in Brevo.',
      isSecret: true,
      isRequired: true,
    },
    BREVO_FOLDER_NAME: {
      universalIdentifier: BREVO_FOLDER_NAME_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Brevo folder',
      description: 'The Brevo folder new lists are created in.',
      value: 'Twenty',
    },
  },
});
