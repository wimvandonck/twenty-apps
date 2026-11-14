import { defineView } from 'twenty-sdk/define';

import {
  EMAIL_TYPE_CONSENT_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
  EMAIL_TYPE_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  EMAIL_TYPE_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
  EMAIL_TYPE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  EMAIL_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export const ALL_EMAIL_TYPE_VIEW_UNIVERSAL_IDENTIFIER = '4c834ba8-b7bd-4d4f-8724-3a2153ea9b78';

export default defineView({
  universalIdentifier: ALL_EMAIL_TYPE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All email types',
  objectUniversalIdentifier: EMAIL_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'TABLE',
  icon: 'IconList',
  position: 0,
  fields: [
    {
      universalIdentifier: '8f2753e9-7632-4c9e-aaf1-a41aff2810af',
      fieldMetadataUniversalIdentifier: EMAIL_TYPE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '2147fe91-7df0-4675-b5be-bc4c9831e72d',
      fieldMetadataUniversalIdentifier: EMAIL_TYPE_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'd5611e02-214e-420c-8937-7e83e56daf81',
      fieldMetadataUniversalIdentifier: EMAIL_TYPE_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '3c4cb8b5-23f2-4ad8-9fdb-79176874abee',
      fieldMetadataUniversalIdentifier: EMAIL_TYPE_CONSENT_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
  ],
});
