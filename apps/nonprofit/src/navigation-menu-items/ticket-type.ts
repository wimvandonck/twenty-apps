import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { TICKET_TYPE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { EVENTS_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/events-folder';

export default defineNavigationMenuItem({
  universalIdentifier: 'feee7d0a-fd5b-4354-8352-0fce89ac740f',
  name: 'Ticket types',
  icon: 'IconTicket',
  color: 'blue',
  position: 2,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: TICKET_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: EVENTS_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
