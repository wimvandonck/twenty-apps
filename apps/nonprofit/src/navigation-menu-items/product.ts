import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { SHOP_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/shop-folder';

export default defineNavigationMenuItem({
  universalIdentifier: 'd50b7898-6893-4301-bcec-8180609e982b',
  name: 'Products',
  icon: 'IconShoppingBag',
  color: 'green',
  position: 1,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: SHOP_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
