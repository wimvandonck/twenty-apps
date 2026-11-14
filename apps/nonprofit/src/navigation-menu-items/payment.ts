import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';

export default defineNavigationMenuItem({
  universalIdentifier: '4b07235a-69a4-450c-967f-7721fbfb77c7',
  name: 'Payments',
  icon: 'IconCreditCard',
  color: 'purple',
  position: 5,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
});
