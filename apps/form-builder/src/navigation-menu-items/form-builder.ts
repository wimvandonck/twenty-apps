import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { FORM_BUILDER_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: '959fefd5-6bb7-4e26-bd1d-f5f689e01cea',
  name: 'Form builder',
  icon: 'IconForms',
  color: 'blue',
  position: -1,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: FORM_BUILDER_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
});
