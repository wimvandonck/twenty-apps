import { defineView } from 'twenty-sdk/define';

import {
  PAYMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_METHOD_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  PAYMENT_PAID_AT_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_PAYER_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  PAYMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineView({
  universalIdentifier: 'cd52b8cb-1578-40aa-a580-8c9dabb21cb1',
  name: 'All payments',
  objectUniversalIdentifier: PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'TABLE',
  icon: 'IconList',
  position: 0,
  fields: [
    {
      universalIdentifier: 'ac2fb411-de6f-489e-8b97-6f3144aa7a10',
      fieldMetadataUniversalIdentifier: PAYMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '21981165-e05a-4fe1-b8bf-5defd8685469',
      fieldMetadataUniversalIdentifier: PAYMENT_PAYER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '59564bbc-2a95-4e8b-b0a7-280a362b5526',
      fieldMetadataUniversalIdentifier: PAYMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '3e79e6ee-916b-4830-a59d-06927adaa6d3',
      fieldMetadataUniversalIdentifier: PAYMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '2efacabb-5d11-44c9-bed8-0f0f9eaa55de',
      fieldMetadataUniversalIdentifier: PAYMENT_METHOD_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '39fef511-47c8-4350-b4e3-41259389bb0d',
      fieldMetadataUniversalIdentifier: PAYMENT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '270bdbba-7148-4fbf-a717-7d8f2a03a5ee',
      fieldMetadataUniversalIdentifier: PAYMENT_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '91be9bc3-795d-49cf-bf3c-748d7199ce2b',
      fieldMetadataUniversalIdentifier: PAYMENT_PAID_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 160,
    },
  ],
});
