import { defineView } from 'twenty-sdk/define';

import {
  CAMPAIGN_ENDS_ON_FIELD_UNIVERSAL_IDENTIFIER,
  CAMPAIGN_GOAL_FIELD_UNIVERSAL_IDENTIFIER,
  CAMPAIGN_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  CAMPAIGN_OBJECT_UNIVERSAL_IDENTIFIER,
  CAMPAIGN_STARTS_ON_FIELD_UNIVERSAL_IDENTIFIER,
  CAMPAIGN_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineView({
  universalIdentifier: '3aa05cec-23b5-4de8-8381-06910b39d454',
  name: 'All campaigns',
  objectUniversalIdentifier: CAMPAIGN_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'TABLE',
  icon: 'IconList',
  position: 0,
  fields: [
    {
      universalIdentifier: '903850c2-76c1-480b-9871-6360812ba9a9',
      fieldMetadataUniversalIdentifier: CAMPAIGN_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '7455d2f4-0de1-4dd7-9aef-c57fe1c82fbb',
      fieldMetadataUniversalIdentifier: CAMPAIGN_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'ae50f39c-8dfd-49ee-8cb9-de5202addccc',
      fieldMetadataUniversalIdentifier: CAMPAIGN_GOAL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '6a01c03d-fb2e-49f6-ad05-086f9f622111',
      fieldMetadataUniversalIdentifier: CAMPAIGN_STARTS_ON_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'ebe4ddbb-546f-4bac-b867-1b96d6d79650',
      fieldMetadataUniversalIdentifier: CAMPAIGN_ENDS_ON_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
  ],
});
