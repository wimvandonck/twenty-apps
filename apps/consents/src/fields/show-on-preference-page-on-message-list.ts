import { defineField, FieldType, STANDARD_OBJECT } from 'twenty-sdk/define';

import {
  MESSAGE_LIST_SHOW_ON_PREFERENCE_PAGE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineField({
  objectUniversalIdentifier: STANDARD_OBJECT.messageList.universalIdentifier,
  universalIdentifier: MESSAGE_LIST_SHOW_ON_PREFERENCE_PAGE_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldType.BOOLEAN,
  name: 'showOnPreferencePage',
  label: 'Show on preferences page',
  description: 'Lets people join or leave this list on the preferences page',
  icon: 'IconEye',
  defaultValue: false,
});
