import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: '42b63116-3fdf-4e7d-9293-0428e8e08b2f',
  name: 'Event layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: 'dfe5d023-bc48-4881-95a3-4e1352a9ba81',
  tabs: [
    {
      universalIdentifier: '6faa5372-1fbd-4c9d-8f05-422d6f83be20',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'c189ee57-743d-456a-aab0-df10c1323c17',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '765f669e-fb77-43ed-ac9a-3c27003cc528',
          },
        },
      ],
    },
    {
      universalIdentifier: '56d26680-384a-4149-af9b-f9e90b5adbbd',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '5b6de508-54b5-4234-89ca-d4bc17f635bc',
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
