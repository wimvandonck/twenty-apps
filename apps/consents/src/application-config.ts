import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  BREVO_API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER,
  CONSENT_SIGNING_SECRET_VARIABLE_UNIVERSAL_IDENTIFIER,
  ORGANIZATION_NAME_VARIABLE_UNIVERSAL_IDENTIFIER,
  SENDER_EMAIL_VARIABLE_UNIVERSAL_IDENTIFIER,
  SENDER_NAME_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  applicationVariables: {
    CONSENT_SIGNING_SECRET: {
      universalIdentifier: CONSENT_SIGNING_SECRET_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Signing secret',
      description:
        'A long random string that signs confirmation and preference links. Changing it makes every link sent so far stop working.',
      isSecret: true,
      isRequired: true,
    },
    BREVO_API_KEY: {
      universalIdentifier: BREVO_API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Brevo API key',
      description:
        'Optional. With a key the app sends confirmation mails through Brevo; without one, send them with a Twenty workflow that uses the confirmation link on the consent.',
      isSecret: true,
    },
    SENDER_EMAIL: {
      universalIdentifier: SENDER_EMAIL_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Sender email',
      description: 'The address confirmation mails come from. It must be a verified sender in Brevo.',
    },
    SENDER_NAME: {
      universalIdentifier: SENDER_NAME_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Sender name',
      description: 'The name confirmation mails come from.',
    },
    ORGANIZATION_NAME: {
      universalIdentifier: ORGANIZATION_NAME_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Organization name',
      description: 'Shown in confirmation mails and on the public pages.',
    },
  },
});
