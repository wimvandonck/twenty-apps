import { defineField, FieldType } from 'twenty-sdk/define';

import {
  FORM_IS_PUBLISHED_FIELD_UNIVERSAL_IDENTIFIER,
  FORM_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: FORM_IS_PUBLISHED_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'isPublished',
  label: 'Published',
  description: 'Only published forms are reachable from their public link',
  icon: 'IconWorld',
  type: FieldType.BOOLEAN,
  defaultValue: false,
  objectUniversalIdentifier: FORM_OBJECT_UNIVERSAL_IDENTIFIER,
});
