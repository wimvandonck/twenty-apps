import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

import { CONSENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';

export default definePageLayout({
  universalIdentifier: '29e1a342-b356-4f53-a79a-933df9666745',
  name: 'Consent layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: CONSENT_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '884b8a55-24b3-4dae-bf35-76e01d756486',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '84e13068-6d5b-4798-a65f-c2afa1f9dd66',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '003a64b4-53db-414a-9d3e-270244daacba',
          },
        },
      ],
    },
    {
      universalIdentifier: 'f3fae278-4d51-4467-b541-423e80029c5e',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '73dab90e-8458-4359-acb2-fe3dd33868dd',
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
