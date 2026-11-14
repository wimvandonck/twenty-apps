import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: '747f5c0e-3da6-4bd4-8fca-58bd5870c6d5',
  name: 'Recurring donation layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: '8fbc6726-a899-47ee-89f2-0b258484659e',
  tabs: [
    {
      universalIdentifier: 'eb8f9c35-73b2-4c47-b4b4-73d122198331',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '24203f67-ff3f-461b-a107-62e65c575bb0',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '3c991bf3-9cd2-4e28-ad29-ec7f0421bf6c',
          },
        },
      ],
    },
    {
      universalIdentifier: 'bdef1cec-f6de-42c2-9a90-9953c9b94c17',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'b18ac4d3-2be1-4223-8d7e-4f4b3acabb65',
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
