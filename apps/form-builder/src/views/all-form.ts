import { defineView } from 'twenty-sdk/define';

import { FORM_IS_PUBLISHED_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: 'a9954fae-1561-4120-8d71-29adb6155086',
  name: 'All forms',
  objectUniversalIdentifier: '483eccf6-59f8-4cac-a368-bf1d06ad7e06',
  type: 'TABLE',
  icon: 'IconTable',
  position: 0,
  fields: [
    {
      universalIdentifier: '3b18ec9a-6bf6-4344-aea7-ae6f2140aa96',
      fieldMetadataUniversalIdentifier: '5967b72b-55e1-4aee-992e-712d6eec4bcf',
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '89f5f968-7577-4e98-b620-f891c246c0b2',
      fieldMetadataUniversalIdentifier: FORM_IS_PUBLISHED_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 120,
    },
  ],
});
