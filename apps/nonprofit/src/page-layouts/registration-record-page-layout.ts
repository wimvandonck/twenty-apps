import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: '3153650f-ba31-4b5a-9d9e-f6d3cfe5c3a3',
  name: 'Registration layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: '83ef68d7-4870-4944-9759-f31eac18d202',
  tabs: [
    {
      universalIdentifier: 'f642c923-911d-4548-a197-6d7b5ecd8eed',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '00b90f81-c994-4719-81dc-94827e58234f',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '500f47d2-05ca-4f90-b01a-79864f84fbe7',
          },
        },
      ],
    },
    {
      universalIdentifier: '87bd3884-7a34-46ee-9276-35741cd4c721',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '5f30d12a-1549-43e8-8ddc-e1d535b89eba',
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
