import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { DONATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { FUNDRAISING_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/fundraising-folder';

export default defineNavigationMenuItem({
  universalIdentifier: '956cd60a-4eb8-42f9-a371-1194b774b741',
  name: 'Donations',
  icon: 'IconHeartHandshake',
  color: 'red',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: DONATION_OBJECT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: FUNDRAISING_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
