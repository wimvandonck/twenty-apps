import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { RECURRING_DONATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { FUNDRAISING_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/fundraising-folder';

export default defineNavigationMenuItem({
  universalIdentifier: 'f8284b81-a2cb-4906-bf94-ef069e9d319a',
  name: 'Recurring donations',
  icon: 'IconRepeat',
  color: 'red',
  position: 1,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: RECURRING_DONATION_OBJECT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: FUNDRAISING_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
