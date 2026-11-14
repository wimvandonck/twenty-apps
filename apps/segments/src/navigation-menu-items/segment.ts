import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

import { SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';

// Right after Mailings (position 10) in the sidebar.
export default defineNavigationMenuItem({
  universalIdentifier: '85a21cfe-2045-4be1-9fba-1ccbb226b8a4',
  name: 'Segments',
  icon: 'IconFilter',
  color: 'orange',
  position: 10.5,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
});
