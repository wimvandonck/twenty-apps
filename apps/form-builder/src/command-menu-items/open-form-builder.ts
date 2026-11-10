import { defineCommandMenuItem } from 'twenty-sdk/define';

import {
  FORM_OBJECT_UNIVERSAL_IDENTIFIER,
  OPEN_FORM_BUILDER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Shown as a button on a form's record page and when one form is selected in
// the list.
export default defineCommandMenuItem({
  universalIdentifier: '8d045977-bb2b-4776-96a6-b9ecf7021ca7',
  label: 'Open in form builder',
  shortLabel: 'Open in form builder',
  isPinned: true,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier: FORM_OBJECT_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    OPEN_FORM_BUILDER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
