import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { MEMBERSHIP_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { MEMBERSHIP_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/membership-folder';

export default defineNavigationMenuItem({
  universalIdentifier: '1ff976e8-1fe3-4b70-8974-548f043d7367',
  name: 'Memberships',
  icon: 'IconId',
  color: 'orange',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: MEMBERSHIP_OBJECT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: MEMBERSHIP_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
