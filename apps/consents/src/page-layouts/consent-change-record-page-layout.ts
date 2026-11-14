import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

import { CONSENT_CHANGE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';

export default definePageLayout({
  universalIdentifier: '3ed63571-1090-4140-9e61-0cb5bcff7660',
  name: 'Consent change layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: CONSENT_CHANGE_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'e11db5d3-3ccf-4dcb-9a59-873accc75744',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'a0117a5a-bc1f-4879-9f04-84699e6e1898',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '9113f92a-9ad8-4dbb-8169-8c90d7d749d0',
          },
        },
      ],
    },
    {
      universalIdentifier: '758c77c6-3e6f-4b3c-91f0-9c497e16fc8e',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '8b7cf952-d7aa-4fba-9aff-0ed751889785',
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
