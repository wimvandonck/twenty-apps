import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

export const SHOP_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER = '050c05c2-e874-4da0-a493-d151cbe0fabb';

export default defineNavigationMenuItem({
  universalIdentifier: SHOP_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Shop',
  icon: 'IconShoppingBag',
  color: 'green',
  position: 4,
  type: NavigationMenuItemType.FOLDER,
});
