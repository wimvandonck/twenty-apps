import { defineView } from 'twenty-sdk/define';

import {
  SEGMENT_LAST_CALCULATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  SEGMENT_LAST_RESULT_FIELD_UNIVERSAL_IDENTIFIER,
  SEGMENT_LIST_FIELD_UNIVERSAL_IDENTIFIER,
  SEGMENT_MEMBER_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  SEGMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  SEGMENT_MODE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineView({
  universalIdentifier: 'd9a06435-ebd6-42cd-af52-5bf2f0340c3d',
  name: 'All segments',
  objectUniversalIdentifier: SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'TABLE',
  icon: 'IconList',
  position: 0,
  fields: [
    {
      universalIdentifier: '6a4c427b-3e20-4593-b6bb-3a5b1da039fc',
      fieldMetadataUniversalIdentifier: SEGMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'e931aa99-daa6-4ec4-96dd-bb6a862c3c90',
      fieldMetadataUniversalIdentifier: SEGMENT_MODE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '971cf757-7bf7-4749-84b3-759bed72856f',
      fieldMetadataUniversalIdentifier: SEGMENT_LIST_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'cca74419-5821-4d21-8ac0-fdd24fb31656',
      fieldMetadataUniversalIdentifier: SEGMENT_MEMBER_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'a64ed9ab-0840-458a-ae7f-453015e03872',
      fieldMetadataUniversalIdentifier: SEGMENT_LAST_CALCULATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '19108115-cea0-48c2-b1da-1ee2ae9c53ef',
      fieldMetadataUniversalIdentifier: SEGMENT_LAST_RESULT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 180,
    },
  ],
});
