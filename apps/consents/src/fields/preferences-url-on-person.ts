import { defineField, FieldType, STANDARD_OBJECT } from 'twenty-sdk/define';

import {
  PERSON_PREFERENCES_URL_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/data-model';

export default defineField({
  objectUniversalIdentifier: STANDARD_OBJECT.person.universalIdentifier,
  universalIdentifier: PERSON_PREFERENCES_URL_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldType.TEXT,
  name: 'preferencesUrl',
  label: 'Preferences link',
  description: 'Personal link to the email preferences page',
  icon: 'IconAdjustments',
});
