import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

export const CONSENTS_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER = '7bb8bb60-a139-4fdb-a768-7027d0027b3b';

export default defineNavigationMenuItem({
  universalIdentifier: CONSENTS_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Consents',
  icon: 'IconShieldCheck',
  color: 'turquoise',
  position: 5,
  type: NavigationMenuItemType.FOLDER,
});
