import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { ORDER_LINE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { SHOP_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/shop-folder';

export default defineNavigationMenuItem({
  universalIdentifier: '6b5ff8a3-2138-4485-89d5-faed5990917c',
  name: 'Order lines',
  icon: 'IconListNumbers',
  color: 'green',
  position: 2,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: ORDER_LINE_OBJECT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: SHOP_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
