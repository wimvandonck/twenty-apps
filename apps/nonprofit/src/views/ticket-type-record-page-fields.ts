import { defineView } from 'twenty-sdk/define';

import {
  TICKET_TYPE_CAPACITY_FIELD_UNIVERSAL_IDENTIFIER,
  TICKET_TYPE_IS_AVAILABLE_FIELD_UNIVERSAL_IDENTIFIER,
  TICKET_TYPE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  TICKET_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  TICKET_TYPE_ORGANIZED_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  TICKET_TYPE_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
  TICKET_TYPE_REGISTRATIONS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineView({
  universalIdentifier: '76c07636-74b0-4852-af19-f3b960ee0ba8',
  name: 'Ticket type fields',
  objectUniversalIdentifier: TICKET_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: 'FIELDS_WIDGET',
  icon: 'IconListDetails',
  position: 0,
  fields: [
    {
      universalIdentifier: '7bef53db-5ade-4212-88fd-d06045c64986',
      fieldMetadataUniversalIdentifier: TICKET_TYPE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '0957dd88-c7ad-479a-b57e-c671eeef0893',
      fieldMetadataUniversalIdentifier: TICKET_TYPE_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'd41e1a14-6d89-4263-9320-ef7d4528465b',
      fieldMetadataUniversalIdentifier: TICKET_TYPE_CAPACITY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'd75fd052-1137-4486-bb03-66c55a56aa08',
      fieldMetadataUniversalIdentifier: TICKET_TYPE_IS_AVAILABLE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '10c540df-f712-404a-ba85-f2d12b6d61e2',
      fieldMetadataUniversalIdentifier: TICKET_TYPE_ORGANIZED_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'a3eec61f-e618-4c8c-b9c0-96108f579a7d',
      fieldMetadataUniversalIdentifier: TICKET_TYPE_REGISTRATIONS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '1b4e9e27-7e13-4988-8789-92a8760045a2',
      fieldMetadataUniversalIdentifier: '63c7cc27-b214-503e-9744-593a077dedb8',
      position: 6,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '453fe43f-1908-4762-b3c0-19867bd584c6',
      fieldMetadataUniversalIdentifier: 'ecc696ce-efb2-5e73-a72f-e2613a88b749',
      position: 7,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'b4ddd220-ff47-4149-ac7a-f685064ff0f9',
      fieldMetadataUniversalIdentifier: 'eae85a4e-dd04-58ee-89fc-5bf6a7cb84b8',
      position: 8,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '0b1a4fff-9f14-4324-b95d-1dcb930bb17c',
      fieldMetadataUniversalIdentifier: '897dddc7-c134-5b58-a1f1-fa77afb53f6c',
      position: 9,
      isVisible: true,
      size: 160,
    },
  ],
});
