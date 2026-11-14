import { defineView } from 'twenty-sdk/define';

import {
  MEMBERSHIP_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_ENDS_ON_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_MEMBERSHIP_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_OBJECT_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_STARTS_ON_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export const ALL_MEMBERSHIP_VIEW_UNIVERSAL_IDENTIFIER = '43d82466-c0cc-43cb-a14c-d7c8a4d2e718';

export default defineView({
  universalIdentifier: ALL_MEMBERSHIP_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All memberships',
  objectUniversalIdentifier: MEMBERSHIP_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'TABLE',
  icon: 'IconList',
  position: 0,
  fields: [
    {
      universalIdentifier: '2fbfc952-c8f7-4c56-93db-b58384e16a43',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '3c1f2446-566f-4619-ae08-88e667e4c811',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'a2bcc822-19d2-415f-807e-95e0e8920165',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '87335011-4f4f-4aed-9a0f-1b121b904446',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_MEMBERSHIP_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'cb48fd61-1f8b-4287-9dad-d749895e7c7b',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '89f80278-1b54-4de7-af01-9d49a24e525d',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_STARTS_ON_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '4fdeee24-0504-4370-8df5-f9cd4d98a060',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_ENDS_ON_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '09c6f5a1-bf24-47c6-a5ad-87bf2996b425',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 160,
    },
  ],
});
