import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { GREETING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/greeting';

export default defineNavigationMenuItem({
  universalIdentifier: 'f492de7d-4550-4382-87ca-22d2babcb982',
  name: 'Greetings',
  icon: 'IconHandStop',
  color: 'blue',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: GREETING_OBJECT_UNIVERSAL_IDENTIFIER,
});
