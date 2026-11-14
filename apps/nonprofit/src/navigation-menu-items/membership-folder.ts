import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

export const MEMBERSHIP_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER = '3f744ffc-7ae0-4a4b-945a-801ac1eab1d7';

export default defineNavigationMenuItem({
  universalIdentifier: MEMBERSHIP_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Membership',
  icon: 'IconId',
  color: 'orange',
  position: 5,
  type: NavigationMenuItemType.FOLDER,
});
