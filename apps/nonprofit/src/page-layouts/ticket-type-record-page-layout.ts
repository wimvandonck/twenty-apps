import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: 'c6979210-0b36-4acf-ac3d-76b5c30c1f44',
  name: 'Ticket type layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: '4d3b0322-cc77-4d1e-b083-3ef625ce023a',
  tabs: [
    {
      universalIdentifier: '688eb281-ac91-48b9-b019-b099d5e392e6',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'df65eeff-e3df-4270-aae4-c66aa0390295',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '76c07636-74b0-4852-af19-f3b960ee0ba8',
          },
        },
      ],
    },
    {
      universalIdentifier: '04d83e6f-f982-4266-b522-8196dfcf5aac',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '4edaafbb-ec80-453f-9e24-c60bdb259685',
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
