import { defineView } from 'twenty-sdk/define';

import {
  EMAIL_TYPE_CONSENTS_FIELD_UNIVERSAL_IDENTIFIER,
  EMAIL_TYPE_CONSENT_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
  EMAIL_TYPE_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  EMAIL_TYPE_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
  EMAIL_TYPE_MESSAGE_LISTS_FIELD_UNIVERSAL_IDENTIFIER,
  EMAIL_TYPE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  EMAIL_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export const EMAIL_TYPE_RECORD_PAGE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER = '7850ebc5-5a48-4819-8f65-bc63cc62202c';

export default defineView({
  universalIdentifier: EMAIL_TYPE_RECORD_PAGE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Email type fields',
  objectUniversalIdentifier: EMAIL_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'FIELDS_WIDGET',
  icon: 'IconListDetails',
  position: 0,
  fields: [
    {
      universalIdentifier: '6a6c22e7-4c4a-4db2-828f-c680e29c5c17',
      fieldMetadataUniversalIdentifier: EMAIL_TYPE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '01231869-427f-4df2-94b2-1b4fff4df84a',
      fieldMetadataUniversalIdentifier: EMAIL_TYPE_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '34f0cf0d-4a67-4027-8667-6f3cfcf64f27',
      fieldMetadataUniversalIdentifier: EMAIL_TYPE_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '99d03001-b4ff-4c93-8f68-61f0ea5f4696',
      fieldMetadataUniversalIdentifier: EMAIL_TYPE_CONSENT_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'd95a3516-8792-45b2-a03d-fa2de8e1d54a',
      fieldMetadataUniversalIdentifier: EMAIL_TYPE_CONSENTS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'f26d4dda-c025-44ef-92c3-2e0aa12f5a38',
      fieldMetadataUniversalIdentifier: EMAIL_TYPE_MESSAGE_LISTS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
  ],
});
