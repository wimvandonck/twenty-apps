import { defineField, FieldType, RelationType, STANDARD_OBJECT } from 'twenty-sdk/define';

import {
  CONSENT_OBJECT_UNIVERSAL_IDENTIFIER,
  CONSENT_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  PERSON_CONSENTS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineField({
  objectUniversalIdentifier: STANDARD_OBJECT.person.universalIdentifier,
  universalIdentifier: PERSON_CONSENTS_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'consents',
  label: 'Consents',
  icon: 'IconShieldCheck',
  relationTargetObjectMetadataUniversalIdentifier: CONSENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: CONSENT_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
