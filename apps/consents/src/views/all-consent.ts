import { defineView } from 'twenty-sdk/define';

import {
  CONSENT_CONFIRMATION_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_EMAIL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_GRANTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_OBJECT_UNIVERSAL_IDENTIFIER,
  CONSENT_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_WITHDRAWN_AT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export const ALL_CONSENT_VIEW_UNIVERSAL_IDENTIFIER = 'aec07ab9-4902-4e44-8e6d-d6c8f8cb7bcb';

export default defineView({
  universalIdentifier: ALL_CONSENT_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All consents',
  objectUniversalIdentifier: CONSENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'TABLE',
  icon: 'IconList',
  position: 0,
  fields: [
    {
      universalIdentifier: 'dd23957f-05d0-4bea-a1dd-92c01db3ea14',
      fieldMetadataUniversalIdentifier: CONSENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'f7d27461-b29a-474d-b9d1-d790c27ac963',
      fieldMetadataUniversalIdentifier: CONSENT_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'caab2f52-3ac0-475b-b86f-4115c2859097',
      fieldMetadataUniversalIdentifier: CONSENT_EMAIL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '2bc5555f-b0d0-4b39-86d4-59c8d9e9664a',
      fieldMetadataUniversalIdentifier: CONSENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '63c48d41-bfaf-411a-810f-2eb8f8463a75',
      fieldMetadataUniversalIdentifier: CONSENT_GRANTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '41971743-b7eb-4d86-a611-fec405d946e9',
      fieldMetadataUniversalIdentifier: CONSENT_WITHDRAWN_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'cee1aca5-0abc-45c1-8738-6b2c5695b241',
      fieldMetadataUniversalIdentifier: CONSENT_CONFIRMATION_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 160,
    },
  ],
});
