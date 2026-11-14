import { defineField, FieldType, STANDARD_OBJECT } from 'twenty-sdk/define';

import { MESSAGE_LIST_BREVO_LIST_ID_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  objectUniversalIdentifier: STANDARD_OBJECT.messageList.universalIdentifier,
  universalIdentifier: MESSAGE_LIST_BREVO_LIST_ID_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldType.NUMBER,
  name: 'brevoListId',
  label: 'Brevo list ID',
  description: 'The Brevo list this list is synced with, filled in by the Brevo sync app',
  icon: 'IconListNumbers',
});
