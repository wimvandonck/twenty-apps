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
  universalIdentifier: '30986295-855c-47be-ac3a-4e3ec9d06e69',
  name: 'Order line fields',
  objectUniversalIdentifier: ORDER_LINE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'FIELDS_WIDGET',
  icon: 'IconListDetails',
  position: 0,
  fields: [
    {
      universalIdentifier: 'cd9b9c2a-83fd-4706-a689-3d0307befff9',
      fieldMetadataUniversalIdentifier: ORDER_LINE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '99a843e7-9a24-4cbb-94fb-1877970620f9',
      fieldMetadataUniversalIdentifier: ORDER_LINE_QUANTITY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'bd0dc172-aaee-4d3d-9f4e-7b469fc9e880',
      fieldMetadataUniversalIdentifier: ORDER_LINE_UNIT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'ddc54d51-703e-45d8-b077-2ba74e811e82',
      fieldMetadataUniversalIdentifier: ORDER_LINE_LINE_TOTAL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'ce4c9318-68c0-4082-8b36-45b3890f32c3',
      fieldMetadataUniversalIdentifier: ORDER_LINE_ORDER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'fac1a027-6e1d-4283-8d0e-fca088603eec',
      fieldMetadataUniversalIdentifier: ORDER_LINE_PRODUCT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '3049b369-8f85-4a44-8464-90ff2b940ff7',
      fieldMetadataUniversalIdentifier: '53ad533e-6774-5304-b3c1-e6c971a094bb',
      position: 6,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '7c250b22-18d2-4734-b177-b810f0d5db52',
      fieldMetadataUniversalIdentifier: 'cfe368db-a7a2-5cb1-9375-fb62d29d603e',
      position: 7,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '4b398b49-19c8-47d9-b791-7f2081bdc17d',
      fieldMetadataUniversalIdentifier: '6ba1e0d8-7415-5500-bb19-5d3a98c72de2',
      position: 8,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '25de5ad2-f20e-4d69-b563-4634cc869b0d',
      fieldMetadataUniversalIdentifier: 'a9f3afeb-48ee-57c9-bda3-f1ac220c05c2',
      position: 9,
      isVisible: true,
      size: 160,
    },
  ],
});
