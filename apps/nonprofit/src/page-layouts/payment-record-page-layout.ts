import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: '22944c07-26ba-4284-b22b-44ce8dd34084',
  name: 'Payment layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: 'a3d68559-cf48-4257-97cc-31a3a4066134',
  tabs: [
    {
      universalIdentifier: '0e80ef01-85f8-4204-8596-05b6f7c13df3',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '14cc7981-f27d-4cea-b178-c5cc854f121f',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: 'ad658a65-0ee6-4c52-9681-e03e9fee3aee',
          },
        },
      ],
    },
    {
      universalIdentifier: '2d46eae1-a30d-4b4c-b78c-6948fd27171e',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '4b401b60-c873-49e4-affe-87d027be5ed5',
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
