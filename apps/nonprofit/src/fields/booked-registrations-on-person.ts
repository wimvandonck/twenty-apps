import { defineField, FieldType, RelationType, STANDARD_OBJECT } from 'twenty-sdk/define';

import {
  PERSON_BOOKED_REGISTRATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  REGISTRATION_BOOKED_BY_FIELD_UNIVERSAL_IDENTIFIER,
  REGISTRATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineField({
  universalIdentifier: PERSON_BOOKED_REGISTRATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'bookedRegistrations',
  label: 'Booked registrations',
  icon: 'IconClipboardCheck',
  relationTargetObjectMetadataUniversalIdentifier: REGISTRATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: REGISTRATION_BOOKED_BY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
