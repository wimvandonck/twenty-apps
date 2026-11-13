import { defineView } from 'twenty-sdk/define';

import {
  ORGANIZED_EVENT_CAPACITY_FIELD_UNIVERSAL_IDENTIFIER,
  ORGANIZED_EVENT_ENDS_AT_FIELD_UNIVERSAL_IDENTIFIER,
  ORGANIZED_EVENT_LOCATION_FIELD_UNIVERSAL_IDENTIFIER,
  ORGANIZED_EVENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  ORGANIZED_EVENT_OBJECT_UNIVERSAL_IDENTIFIER,
  ORGANIZED_EVENT_ONLINE_LINK_FIELD_UNIVERSAL_IDENTIFIER,
  ORGANIZED_EVENT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
  ORGANIZED_EVENT_REGISTRATION_DEADLINE_FIELD_UNIVERSAL_IDENTIFIER,
  ORGANIZED_EVENT_STARTS_AT_FIELD_UNIVERSAL_IDENTIFIER,
  ORGANIZED_EVENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineView({
  universalIdentifier: '1aba7851-2144-4e00-b3b5-7896a668287e',
  name: 'All events',
  objectUniversalIdentifier: ORGANIZED_EVENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'TABLE',
  icon: 'IconList',
  position: 0,
  fields: [
    {
      universalIdentifier: '23ed3ebb-4c0b-4be5-9d10-81b967435cd9',
      fieldMetadataUniversalIdentifier: ORGANIZED_EVENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '9faffde7-2732-448f-8c4f-13708d620361',
      fieldMetadataUniversalIdentifier: ORGANIZED_EVENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '58577df9-bbdf-47c1-bded-391c38192a52',
      fieldMetadataUniversalIdentifier: ORGANIZED_EVENT_STARTS_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'b40d17b9-9e05-4525-b276-212d10d91db1',
      fieldMetadataUniversalIdentifier: ORGANIZED_EVENT_ENDS_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'a9781618-d912-41e2-aba5-f163e047cef7',
      fieldMetadataUniversalIdentifier: ORGANIZED_EVENT_REGISTRATION_DEADLINE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'f6c01807-2d53-4450-a83f-9477ac307400',
      fieldMetadataUniversalIdentifier: ORGANIZED_EVENT_LOCATION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '68ee90ad-081a-4e7e-b01f-d49f747d212c',
      fieldMetadataUniversalIdentifier: ORGANIZED_EVENT_ONLINE_LINK_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '46a62263-d856-45a8-95ad-f0920bfcad0c',
      fieldMetadataUniversalIdentifier: ORGANIZED_EVENT_CAPACITY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '489c4ee3-7eb6-4e36-b050-65b69c5bc8c0',
      fieldMetadataUniversalIdentifier: ORGANIZED_EVENT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 160,
    },
  ],
});
