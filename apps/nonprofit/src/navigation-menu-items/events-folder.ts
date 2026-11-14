import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

export const EVENTS_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER = '20e9db02-7d2a-4683-88e7-eb6fa7ea7a86';

export default defineNavigationMenuItem({
  universalIdentifier: EVENTS_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Events',
  icon: 'IconCalendarEvent',
  color: 'blue',
  position: 2,
  type: NavigationMenuItemType.FOLDER,
});
