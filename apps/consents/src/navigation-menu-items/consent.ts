import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { CONSENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { CONSENTS_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/consents-folder';

export default defineNavigationMenuItem({
  universalIdentifier: '5a625641-716a-4010-9d8c-943802b83d7b',
  name: 'Consents',
  icon: 'IconShieldCheck',
  color: 'turquoise',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: CONSENT_OBJECT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: CONSENTS_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
