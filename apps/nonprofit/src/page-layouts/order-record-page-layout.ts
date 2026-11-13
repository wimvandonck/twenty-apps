import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: 'f0bfe59c-5a85-4bac-b1f8-1a9212276416',
  name: 'Order layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: 'e6a5ac9e-0bfb-465b-ba21-c91ed8b45fcc',
  tabs: [
    {
      universalIdentifier: 'a12a810d-bf51-420b-8723-2b1963aae48f',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '35c2b257-8413-419c-b394-0437eac404da',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '49253aaa-167c-4a12-81f0-ec41f0e32cbc',
          },
        },
      ],
    },
    {
      universalIdentifier: '8e2aafdd-c17d-4330-9cb1-36dda47cdfbb',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'b047e1c8-c26e-47ce-b6bc-4d61fe957399',
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
