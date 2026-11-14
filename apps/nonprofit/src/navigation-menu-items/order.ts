import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { ORDER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { SHOP_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/shop-folder';

export default defineNavigationMenuItem({
  universalIdentifier: '7169140e-6029-4c37-95bb-3758f9b4bea3',
  name: 'Orders',
  icon: 'IconShoppingCart',
  color: 'green',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: ORDER_OBJECT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: SHOP_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
