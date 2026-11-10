import { defineView, ViewType } from 'twenty-sdk/define';

import {
  GREETING_OBJECT_UNIVERSAL_IDENTIFIER,
  MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  NAME_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/greeting';

export default defineView({
  universalIdentifier: 'a879377a-558c-45f6-85b3-62cc85b57fc8',
  name: 'All greetings',
  objectUniversalIdentifier: GREETING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconTable',
  position: 0,
  fields: [
    {
      universalIdentifier: '2f136d9f-4dd5-4fd5-b930-1c7b61f076bf',
      fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '9c730259-fd4e-4f83-94e3-1b7e9ea3eb31',
      fieldMetadataUniversalIdentifier: MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 300,
    },
  ],
});
