import { defineView } from 'twenty-sdk/define';

import {
  CONSENT_CHANGES_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CONFIRMATION_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CONFIRMATION_URL_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_EMAIL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_GRANTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_OBJECT_UNIVERSAL_IDENTIFIER,
  CONSENT_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_WITHDRAWN_AT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export const CONSENT_RECORD_PAGE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER = '003a64b4-53db-414a-9d3e-270244daacba';

export default defineView({
  universalIdentifier: CONSENT_RECORD_PAGE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Consent fields',
  objectUniversalIdentifier: CONSENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'FIELDS_WIDGET',
  icon: 'IconListDetails',
  position: 0,
  fields: [
    {
      universalIdentifier: '224de72c-2b4d-4bcd-903e-65410e4e628d',
      fieldMetadataUniversalIdentifier: CONSENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'd89c63b8-7bdd-4422-810c-1ec76fa1a134',
      fieldMetadataUniversalIdentifier: CONSENT_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '90ddfcd8-1250-47c8-aff6-5cefc3a061a7',
      fieldMetadataUniversalIdentifier: CONSENT_EMAIL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '817140ad-bd81-48b7-aa28-4d3e1243cd9c',
      fieldMetadataUniversalIdentifier: CONSENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'f62c85ff-1ac5-4f1d-9e4a-305adaab95bd',
      fieldMetadataUniversalIdentifier: CONSENT_GRANTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '5696a8a2-4671-4a34-8cae-23a91cce51ce',
      fieldMetadataUniversalIdentifier: CONSENT_WITHDRAWN_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '9cf14ef8-ec51-4511-8196-d67fe0a756b2',
      fieldMetadataUniversalIdentifier: CONSENT_CONFIRMATION_URL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '6cb5fff8-65ad-4469-bab9-722e5af38a85',
      fieldMetadataUniversalIdentifier: CONSENT_CONFIRMATION_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'e800a0e6-3e8a-4ef0-8aa2-9aa49eeef0fd',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGES_FIELD_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 160,
    },
  ],
});
