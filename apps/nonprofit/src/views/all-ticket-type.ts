import { defineView } from 'twenty-sdk/define';

import {
  TICKET_TYPE_CAPACITY_FIELD_UNIVERSAL_IDENTIFIER,
  TICKET_TYPE_IS_AVAILABLE_FIELD_UNIVERSAL_IDENTIFIER,
  TICKET_TYPE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  TICKET_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  TICKET_TYPE_ORGANIZED_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  TICKET_TYPE_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineView({
  universalIdentifier: 'e9f27816-8122-464e-b891-fe4d23287ef9',
  name: 'All ticket types',
  objectUniversalIdentifier: TICKET_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'TABLE',
  icon: 'IconList',
  position: 0,
  fields: [
    {
      universalIdentifier: '4dd6912d-45d7-488e-8aaa-4d425c4ce3ea',
      fieldMetadataUniversalIdentifier: TICKET_TYPE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '7da8fc9c-a469-441b-9bf4-bbc7676ce67b',
      fieldMetadataUniversalIdentifier: TICKET_TYPE_ORGANIZED_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'c5c083cc-9ca6-4af3-a12b-34e52be339d8',
      fieldMetadataUniversalIdentifier: TICKET_TYPE_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'd095940d-44ee-4929-9291-7774cb915824',
      fieldMetadataUniversalIdentifier: TICKET_TYPE_CAPACITY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '517ad2b6-cfa7-414b-985d-4a7dc882b7db',
      fieldMetadataUniversalIdentifier: TICKET_TYPE_IS_AVAILABLE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
  ],
});
