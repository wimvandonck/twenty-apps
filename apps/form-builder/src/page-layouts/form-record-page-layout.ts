import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

import { FORM_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: 'd7721a93-0199-44ac-9c6c-2820b48ea79f',
  name: 'Form',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: FORM_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '62ed042b-9636-4842-8586-70e9160da2f8',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'cca6695b-9b83-434e-b4ec-c0dd13622899',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: 'f8d73349-0ccb-414a-8e6f-77e81d86ebd9',
          },
        },
      ],
    },
    {
      universalIdentifier: 'e192f2f8-9893-4854-90f9-82d958a4d8fa',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'f67f1221-ae83-4692-8768-46ad37726146',
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
