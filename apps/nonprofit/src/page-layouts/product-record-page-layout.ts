import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: '0a004196-72f3-4411-b522-0c50ff93c26f',
  name: 'Product layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: '85168fec-15e7-406f-8bf3-c2761858c8f2',
  tabs: [
    {
      universalIdentifier: '28d4e24b-d7f6-47be-9cb9-c03a9445b2e8',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '97562147-7d4e-4589-be83-8b30a7f6334b',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '85672713-9d69-4704-9308-8a2dfa7da03f',
          },
        },
      ],
    },
    {
      universalIdentifier: 'b83be60a-3302-4f42-afe4-1b9818fce06a',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '83859e18-365e-4ee3-abb5-2a4040c861ac',
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
