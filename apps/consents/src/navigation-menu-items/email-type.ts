import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { EMAIL_TYPE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { CONSENTS_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/consents-folder';

export default defineNavigationMenuItem({
  universalIdentifier: 'bc163415-8f0f-4d20-8878-1cea026fc58a',
  name: 'Email types',
  icon: 'IconMailCog',
  color: 'turquoise',
  position: 1,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: EMAIL_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: CONSENTS_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
