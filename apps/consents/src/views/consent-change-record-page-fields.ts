import { defineView } from 'twenty-sdk/define';

import {
  CONSENT_CHANGE_ACTION_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_CONSENT_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_FORM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_IP_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_LANGUAGE_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_NOTE_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_OBJECT_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_OCCURRED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_SHOWN_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_SUBMISSION_ID_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_USER_AGENT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export const CONSENT_CHANGE_RECORD_PAGE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER = '9113f92a-9ad8-4dbb-8169-8c90d7d749d0';

export default defineView({
  universalIdentifier: CONSENT_CHANGE_RECORD_PAGE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Consent change fields',
  objectUniversalIdentifier: CONSENT_CHANGE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'FIELDS_WIDGET',
  icon: 'IconListDetails',
  position: 0,
  fields: [
    {
      universalIdentifier: 'fa483630-b869-489d-b6dc-6ebb828cf531',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '385a74cb-a6b8-4109-bf5a-5030f85c0d7e',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_CONSENT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '3059c18f-a8d4-4fae-8cb6-5a58c9953868',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_ACTION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '29d44137-c647-4200-83ef-08b35529d9ca',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '8850274e-0179-47bf-a0dc-5e1d820e4609',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_OCCURRED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'f28a2e45-1593-4195-bd48-e5f4f1bf07dc',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_SHOWN_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'e468c4f2-ade0-4cf2-a78f-60f9bf4978d0',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_FORM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '486885dd-7dfd-4ba7-87e1-dd5b70733f3b',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_SUBMISSION_ID_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '49c75b77-e7d4-48a2-8386-e38697140ad4',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_IP_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '69835c4c-d60b-4cee-a410-ffdb78c25c8c',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_USER_AGENT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 9,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '3a180ba1-daa3-4b9a-9056-0bb83d9eb675',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_LANGUAGE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 10,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '9ddf3427-2b07-4b05-bf49-3fd64907efe7',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_NOTE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 11,
      isVisible: true,
      size: 160,
    },
  ],
});
