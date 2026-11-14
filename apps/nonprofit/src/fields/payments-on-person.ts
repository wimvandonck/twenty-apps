import { defineField, FieldType, RelationType, STANDARD_OBJECT } from 'twenty-sdk/define';

import {
  PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  PAYMENT_PAYER_FIELD_UNIVERSAL_IDENTIFIER,
  PERSON_PAYMENTS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineField({
  universalIdentifier: PERSON_PAYMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'payments',
  label: 'Payments',
  icon: 'IconCreditCard',
  relationTargetObjectMetadataUniversalIdentifier: PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PAYMENT_PAYER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
