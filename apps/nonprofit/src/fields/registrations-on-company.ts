import { defineField, FieldType, RelationType, STANDARD_OBJECT } from 'twenty-sdk/define';

import {
  COMPANY_REGISTRATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  REGISTRATION_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  REGISTRATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineField({
  universalIdentifier: COMPANY_REGISTRATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'registrations',
  label: 'Registrations',
  icon: 'IconClipboardCheck',
  relationTargetObjectMetadataUniversalIdentifier: REGISTRATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: REGISTRATION_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
