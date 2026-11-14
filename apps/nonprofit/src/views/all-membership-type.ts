import { defineView } from 'twenty-sdk/define';

import {
  MEMBERSHIP_TYPE_DURATION_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_TYPE_IS_AVAILABLE_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_TYPE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_TYPE_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export const ALL_MEMBERSHIP_TYPE_VIEW_UNIVERSAL_IDENTIFIER = 'f7664c43-05ca-4019-9e86-7008f30d6197';

export default defineView({
  universalIdentifier: ALL_MEMBERSHIP_TYPE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All membership types',
  objectUniversalIdentifier: MEMBERSHIP_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'TABLE',
  icon: 'IconList',
  position: 0,
  fields: [
    {
      universalIdentifier: '0852612d-0035-4add-897f-5964bf588b5a',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_TYPE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'b5492bbc-d3a9-4841-9d60-08993fed7d2c',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_TYPE_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'b97833fa-708a-45bc-bef0-0cdbd325ab46',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_TYPE_DURATION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'd40198fb-f6d1-49bf-9b5d-f5530ba38570',
      fieldMetadataUniversalIdentifier: MEMBERSHIP_TYPE_IS_AVAILABLE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
  ],
});
