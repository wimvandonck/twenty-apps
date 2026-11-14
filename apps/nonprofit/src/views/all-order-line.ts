import { defineView } from 'twenty-sdk/define';

import {
  ORDER_LINE_LINE_TOTAL_FIELD_UNIVERSAL_IDENTIFIER,
  ORDER_LINE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  ORDER_LINE_OBJECT_UNIVERSAL_IDENTIFIER,
  ORDER_LINE_ORDER_FIELD_UNIVERSAL_IDENTIFIER,
  ORDER_LINE_PRODUCT_FIELD_UNIVERSAL_IDENTIFIER,
  ORDER_LINE_QUANTITY_FIELD_UNIVERSAL_IDENTIFIER,
  ORDER_LINE_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineView({
  universalIdentifier: '51470a0e-540b-47d8-b4c8-1491bd30c141',
  name: 'All order lines',
  objectUniversalIdentifier: ORDER_LINE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'TABLE',
  icon: 'IconList',
  position: 0,
  fields: [
    {
      universalIdentifier: 'e7eafdf0-9678-4d5b-b789-af58117ffeca',
      fieldMetadataUniversalIdentifier: ORDER_LINE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '9f34fd0d-1d78-49f9-93f8-195da5de87ba',
      fieldMetadataUniversalIdentifier: ORDER_LINE_ORDER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '48fad111-d2ec-4bc3-a038-43eae57f7194',
      fieldMetadataUniversalIdentifier: ORDER_LINE_PRODUCT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '98b81b4f-0001-485e-b301-e3a752964f9a',
      fieldMetadataUniversalIdentifier: ORDER_LINE_QUANTITY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '193af9b5-5192-4cd0-872e-a4cf78971f7a',
      fieldMetadataUniversalIdentifier: ORDER_LINE_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '129760b4-f0ae-4b41-9d8e-c1054df9a0ac',
      fieldMetadataUniversalIdentifier: ORDER_LINE_LINE_TOTAL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
  ],
});
