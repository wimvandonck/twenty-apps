import { defineField, FieldType, RelationType, STANDARD_OBJECT } from 'twenty-sdk/define';

import {
  PERSON_RECURRING_DONATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_DONATION_DONOR_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_DONATION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineField({
  universalIdentifier: PERSON_RECURRING_DONATIONS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'recurringDonations',
  label: 'Recurring donations',
  icon: 'IconRepeat',
  relationTargetObjectMetadataUniversalIdentifier: RECURRING_DONATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: RECURRING_DONATION_DONOR_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
