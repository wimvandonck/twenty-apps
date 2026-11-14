import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

import { EMAIL_TYPE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';

export default definePageLayout({
  universalIdentifier: '6e8b30a2-1797-47fe-b208-77ec24b55d05',
  name: 'Email type layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: EMAIL_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '5eeb2793-19b8-41ef-8f33-5462810a2b57',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '13b23bfb-3bc7-412f-b01e-62da05291661',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '7850ebc5-5a48-4819-8f65-bc63cc62202c',
          },
        },
      ],
    },
    {
      universalIdentifier: '93a910ae-dbf2-4e29-a1c0-7f5ec38a7936',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'c13f529e-2c18-47d3-8ce8-f2d52784cd75',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
  ],
});
