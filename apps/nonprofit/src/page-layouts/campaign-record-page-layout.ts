import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: '76094db7-dd7d-4274-86ea-9ec948c588bf',
  name: 'Campaign layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: '68987b08-562d-4f2b-821e-43af0f5aa2cc',
  tabs: [
    {
      universalIdentifier: '437fb42a-5425-4b6f-a829-36722d76e003',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'ca13263d-4621-441d-92b8-8e5a4e49677b',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '9de5b334-1fe5-428c-afc0-1d13a1b6541b',
          },
        },
      ],
    },
    {
      universalIdentifier: '0ba6a229-86b9-4517-85c5-a3fbc27c2d6a',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'a169356f-87aa-4ceb-8366-a429e42c4a40',
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
