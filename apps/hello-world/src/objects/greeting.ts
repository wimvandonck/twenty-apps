import { defineObject, FieldType } from 'twenty-sdk/define';

export const GREETING_OBJECT_UNIVERSAL_IDENTIFIER =
  'f4e036c4-17e6-464c-b8be-fa7fd5821c7f';
export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '85f26db4-d8b7-428e-9872-6f94d87132bf';
export const MESSAGE_FIELD_UNIVERSAL_IDENTIFIER =
  '52a9d54e-680e-4e43-9eb0-753122477702';

export default defineObject({
  universalIdentifier: GREETING_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'greeting',
  namePlural: 'greetings',
  labelSingular: 'Greeting',
  labelPlural: 'Greetings',
  icon: 'IconHandStop',
  labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Name of the greeting',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'message',
      label: 'Message',
      description: 'Text of the greeting',
      icon: 'IconMessage',
    },
  ],
});
