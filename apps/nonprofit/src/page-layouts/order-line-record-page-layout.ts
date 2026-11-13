import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: '06bcc6fa-718a-475b-ac56-cf3fe1d9001f',
  name: 'Order line layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: '8d2909f7-97e3-4d11-9245-3d45f4f77bf6',
  tabs: [
    {
      universalIdentifier: '8e32f431-25ef-465a-97dd-ef6a8eeb41b4',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '58418a8f-4335-4051-b49e-b4dcf8c767a8',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '30986295-855c-47be-ac3a-4e3ec9d06e69',
          },
        },
      ],
    },
    {
      universalIdentifier: '03662556-2f16-419e-9e09-301cc32b84bb',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '0f3dc81c-380a-498e-9be5-1028b213f765',
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
