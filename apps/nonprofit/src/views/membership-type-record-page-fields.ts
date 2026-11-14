import { defineView } from 'twenty-sdk/define';

import {
  MEMBERSHIP_TYPE_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_TYPE_DURATION_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_TYPE_IS_AVAILABLE_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_TYPE_MEMBERSHIPS_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_TYPE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_TYPE_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export const MEMBERSHIP_TYPE_RECORD_PAGE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER = 'f05d8e16-2356-4541-9568-9da067334969';

export default defineView({
  universalIdentifier: MEMBERSHIP_TYPE_RECORD_PAGE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Membership type fields',
  objectUniversalIdentifier: MEMBERSHIP_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'FIELDS_WIDGET',
  icon: 'IconListDetails',
  position: 0,
  fields: [
    {
      universalIdentifier: '47c572bf-4793-4bdf-a314-2b9379b6b4b9',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_TYPE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '17d17396-fd5e-4a5b-8515-b5d47f07055d',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_TYPE_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '19fd225f-ff4b-4c1c-9edd-cfdabf641dc7',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_TYPE_DURATION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'be255c47-9b7d-45c9-a024-3ec7b9ef07cd',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_TYPE_IS_AVAILABLE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '26df1918-bd6d-476e-bb2a-128adffa1b4c',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_TYPE_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'f798ffa8-3cf1-4297-bdd8-391b6a17c73d',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_TYPE_MEMBERSHIPS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
  ],
});
