import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { MEMBERSHIP_TYPE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { MEMBERSHIP_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/membership-folder';

export default defineNavigationMenuItem({
  universalIdentifier: '8e7ab69c-c8e1-44a7-ab33-dc38fcd28661',
  name: 'Membership types',
  icon: 'IconIdBadge2',
  color: 'orange',
  position: 1,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: MEMBERSHIP_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: MEMBERSHIP_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
