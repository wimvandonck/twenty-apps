import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { ORGANIZED_EVENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { EVENTS_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/events-folder';

export default defineNavigationMenuItem({
  universalIdentifier: '29f6e129-8ed9-47fd-8ba8-03c6ce5f3938',
  name: 'Events',
  icon: 'IconCalendarEvent',
  color: 'blue',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: ORGANIZED_EVENT_OBJECT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: EVENTS_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
