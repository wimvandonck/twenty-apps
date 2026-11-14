import { defineView } from 'twenty-sdk/define';

import {
  CONSENT_CHANGE_ACTION_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_CONSENT_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_FORM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_OBJECT_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_OCCURRED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  CONSENT_CHANGE_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export const ALL_CONSENT_CHANGE_VIEW_UNIVERSAL_IDENTIFIER = '33fc8cda-1d1c-4d11-b454-072358b890ce';

export default defineView({
  universalIdentifier: ALL_CONSENT_CHANGE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All consent changes',
  objectUniversalIdentifier: CONSENT_CHANGE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'TABLE',
  icon: 'IconList',
  position: 0,
  fields: [
    {
      universalIdentifier: '3bb526c6-6e22-4a1b-946f-8089f6828417',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '256d8554-20f5-44d0-b46e-f31fb4895c8f',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_CONSENT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '9d6d18e8-af3e-4e8d-aaaa-0d894e490666',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_ACTION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '41aafc53-ea95-4cd6-9a76-4c35d6c18be5',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '95f53297-3262-46cd-8bcd-9724f6d64a3b',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_OCCURRED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '6828b51d-8f10-4b6b-bfef-1860e112dcc0',
      fieldMetadataUniversalIdentifier: CONSENT_CHANGE_FORM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
  ],
});
