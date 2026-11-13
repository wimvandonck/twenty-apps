import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { REGISTRATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { EVENTS_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/events-folder';

export default defineNavigationMenuItem({
  universalIdentifier: '5c96a1fd-9126-46e7-b2ae-c25856cbd1a6',
  name: 'Registrations',
  icon: 'IconClipboardCheck',
  color: 'blue',
  position: 1,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: REGISTRATION_OBJECT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: EVENTS_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
