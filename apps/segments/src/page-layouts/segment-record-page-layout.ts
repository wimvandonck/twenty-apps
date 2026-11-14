import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: '26041a47-4be8-413a-ab29-f98912574721',
  name: 'Segment layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: '49ce224a-a40c-4323-8bc4-19430eef5133',
  tabs: [
    {
      universalIdentifier: '0c2fbeaa-2205-44e8-8f44-888c338931d4',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'b3eaf79e-481f-4db5-a6c1-b39edda1fd8a',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '010e4c5f-793c-4303-a5fd-bd93127ce9fc',
          },
        },
      ],
    },
    {
      universalIdentifier: '0591a53a-1c7a-444e-9724-c410610649a5',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '3ad6ddb6-8387-4361-94e2-185f74dbcfb9',
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
