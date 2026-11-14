import { defineField, FieldType, RelationType, STANDARD_OBJECT } from 'twenty-sdk/define';

import {
  MEMBERSHIP_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_OBJECT_UNIVERSAL_IDENTIFIER,
  PERSON_MEMBERSHIPS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineField({
  objectUniversalIdentifier: STANDARD_OBJECT.person.universalIdentifier,
  universalIdentifier: PERSON_MEMBERSHIPS_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'memberships',
  label: 'Memberships',
  icon: 'IconId',
  relationTargetObjectMetadataUniversalIdentifier: MEMBERSHIP_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: MEMBERSHIP_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
