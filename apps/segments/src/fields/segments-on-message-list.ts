import { defineField, FieldType, RelationType, STANDARD_OBJECT } from 'twenty-sdk/define';

import {
  MESSAGE_LIST_SEGMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  SEGMENT_LIST_FIELD_UNIVERSAL_IDENTIFIER,
  SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineField({
  universalIdentifier: MESSAGE_LIST_SEGMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT.messageList.universalIdentifier,
  type: FieldType.RELATION,
  name: 'segments',
  label: 'Segments',
  description: 'Segments that keep this list up to date',
  icon: 'IconFilter',
  relationTargetObjectMetadataUniversalIdentifier: SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: SEGMENT_LIST_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
