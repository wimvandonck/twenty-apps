import { defineField, FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT } from 'twenty-sdk/define';

import {
  EMAIL_TYPE_MESSAGE_LISTS_FIELD_UNIVERSAL_IDENTIFIER,
  EMAIL_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  MESSAGE_LIST_REQUIRED_EMAIL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineField({
  objectUniversalIdentifier: STANDARD_OBJECT.messageList.universalIdentifier,
  universalIdentifier: MESSAGE_LIST_REQUIRED_EMAIL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'requiredEmailType',
  label: 'Required email type',
  icon: 'IconMailCog',
  relationTargetObjectMetadataUniversalIdentifier: EMAIL_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: EMAIL_TYPE_MESSAGE_LISTS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'requiredEmailTypeId',
  },
});
