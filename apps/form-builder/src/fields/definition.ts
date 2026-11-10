import { defineField, FieldType } from 'twenty-sdk/define';

import {
  FORM_DEFINITION_FIELD_UNIVERSAL_IDENTIFIER,
  FORM_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: FORM_DEFINITION_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'definition',
  label: 'Definition',
  description: 'Records, links and fields of the form, edited in the Builder tab',
  icon: 'IconBraces',
  type: FieldType.RAW_JSON,
  objectUniversalIdentifier: FORM_OBJECT_UNIVERSAL_IDENTIFIER,
});
