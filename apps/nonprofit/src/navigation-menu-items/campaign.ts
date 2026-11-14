import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { CAMPAIGN_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { FUNDRAISING_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/fundraising-folder';

export default defineNavigationMenuItem({
  universalIdentifier: '955e9cf2-ba56-4012-aa8f-e6407062cb1d',
  name: 'Campaigns',
  icon: 'IconSpeakerphone',
  color: 'red',
  position: 2,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: CAMPAIGN_OBJECT_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: FUNDRAISING_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
});
