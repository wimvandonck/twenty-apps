import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

export const FORMS_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER = 'f31170ce-0e70-4ad4-8cbe-dd986b47ec52';

export default defineNavigationMenuItem({
  universalIdentifier: FORMS_FOLDER_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Forms',
  icon: 'IconForms',
  color: 'blue',
  position: 6,
  type: NavigationMenuItemType.FOLDER,
});
