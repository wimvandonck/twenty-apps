import { defineView } from 'twenty-sdk/define';

import {
  PRODUCT_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
  PRODUCT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_SKU_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_STOCK_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineView({
  universalIdentifier: '69e1c7e3-43e4-4400-8d3e-0b63693c5a6c',
  name: 'All products',
  objectUniversalIdentifier: PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'TABLE',
  icon: 'IconList',
  position: 0,
  fields: [
    {
      universalIdentifier: 'e00dc123-5d98-48b3-bbff-19cfc84ed394',
      fieldMetadataUniversalIdentifier: PRODUCT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '6dd5436a-542c-45b0-a926-a36ba399d545',
      fieldMetadataUniversalIdentifier: PRODUCT_SKU_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'a4908c08-77b0-4415-aca7-c42f5385f8ea',
      fieldMetadataUniversalIdentifier: PRODUCT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '395bcf74-c29a-4816-9e3b-7821c17caa75',
      fieldMetadataUniversalIdentifier: PRODUCT_STOCK_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'e8cc4596-e13f-4240-9ede-8c6a0846d7fe',
      fieldMetadataUniversalIdentifier: PRODUCT_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
  ],
});
