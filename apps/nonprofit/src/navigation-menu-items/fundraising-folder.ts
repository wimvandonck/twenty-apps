import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

export const FUNDRAISING_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER = '4a4475f7-952b-4036-b011-e22d992da658';

export default defineNavigationMenuItem({
  universalIdentifier: FUNDRAISING_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Fundraising',
  icon: 'IconHeartHandshake',
  color: 'red',
  position: 3,
  type: NavigationMenuItemType.FOLDER,
});
