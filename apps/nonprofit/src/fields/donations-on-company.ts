import { defineField, FieldType, RelationType, STANDARD_OBJECT } from 'twenty-sdk/define';

import {
  COMPANY_DONATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  DONATION_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  DONATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineField({
  universalIdentifier: COMPANY_DONATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'donations',
  label: 'Donations',
  icon: 'IconHeartHandshake',
  relationTargetObjectMetadataUniversalIdentifier: DONATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: DONATION_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
