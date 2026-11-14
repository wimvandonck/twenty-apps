import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

import { MEMBERSHIP_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';

export default definePageLayout({
  universalIdentifier: 'dfb18b19-bafe-4fc6-9b4e-64d494345864',
  name: 'Membership layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: MEMBERSHIP_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '8dc66446-dde6-44a0-8b18-9ee0d4350777',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'c4293594-d25e-4ee2-b2e5-1082b623b052',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '5944984c-1d48-4a14-a459-af8825a7c602',
          },
        },
      ],
    },
    {
      universalIdentifier: 'f29b62e6-8052-4efb-bbf1-ded3740522f1',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'c7d9f547-494c-4e03-af07-89b2b1f09f19',
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
