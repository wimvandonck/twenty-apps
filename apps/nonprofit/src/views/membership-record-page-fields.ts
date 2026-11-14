import { defineView } from 'twenty-sdk/define';

import {
  MEMBERSHIP_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_ENDS_ON_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_MEMBERSHIP_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_NOTE_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_OBJECT_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_PAYMENT_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_STARTS_ON_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export const MEMBERSHIP_RECORD_PAGE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER = '5944984c-1d48-4a14-a459-af8825a7c602';

export default defineView({
  universalIdentifier: MEMBERSHIP_RECORD_PAGE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Membership fields',
  objectUniversalIdentifier: MEMBERSHIP_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'FIELDS_WIDGET',
  icon: 'IconListDetails',
  position: 0,
  fields: [
    {
      universalIdentifier: '4e5f39d6-d88c-496d-b4cc-598707450fb9',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'a5a76f27-99fd-4262-b3a6-26aafd2d27d4',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'e9439af3-d984-44ff-8155-8b49ad0396d1',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '1c375a8d-8f32-40c0-8d5b-a1f0e5c2de75',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_MEMBERSHIP_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '1d6bb025-e069-4806-aec4-2f48ae73e5bb',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '43a758cc-f177-48b9-9749-36936901107c',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_STARTS_ON_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '08a13f89-08e3-4ba6-9ec3-4fd1359690d8',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_ENDS_ON_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '7318ea61-65bd-4f1b-8b9e-27d70a82147c',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '006ed7d9-6e61-41c3-a073-da2b7f07d6a7',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_PAYMENT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '0f14b230-99ff-4de1-aad3-b3c6f6e391c2',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_NOTE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 9,
      isVisible: true,
      size: 160,
    },
  ],
});
