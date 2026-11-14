import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

import { MEMBERSHIP_TYPE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';

export default definePageLayout({
  universalIdentifier: '5ea5f3a2-559e-435d-a14d-e25884256435',
  name: 'Membership type layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: MEMBERSHIP_TYPE_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'fffc9498-1cef-41f6-8d34-e04ac4abb730',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '2c5269cc-4db4-4a0a-85f3-51f11ee2630a',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: 'f05d8e16-2356-4541-9568-9da067334969',
          },
        },
      ],
    },
    {
      universalIdentifier: 'e6e901fa-d7d2-4a26-919b-cb4e20dd8369',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'bc2b1e51-3ee4-4f14-ab23-04336facbc9d',
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
