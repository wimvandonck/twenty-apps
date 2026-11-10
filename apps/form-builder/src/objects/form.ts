import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  FORM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  FORM_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: FORM_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'form',
  namePlural: 'forms',
  labelSingular: 'Form',
  labelPlural: 'Forms',
  description: 'An embeddable form that creates or updates records',
  icon: 'IconForms',
  labelIdentifierFieldMetadataUniversalIdentifier:
    FORM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: FORM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Name of the form',
      icon: 'IconAbc',
    },
  ],
});
