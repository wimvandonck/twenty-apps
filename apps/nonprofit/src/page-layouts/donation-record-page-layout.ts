import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: '4fce570b-e08c-4914-8be4-708be2f1ba0c',
  name: 'Donation layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: 'cb73b4a3-8293-474e-8cfc-ee0110b4dbcc',
  tabs: [
    {
      universalIdentifier: '43412577-427f-4687-af82-dc4121239e9b',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'c1132fcb-bf55-4b9d-b395-a7e30b4a37b2',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: 'aaf36aad-e141-485c-88f7-80a7a51ab71c',
          },
        },
      ],
    },
    {
      universalIdentifier: '7a0fa102-4649-4f98-9645-ab78ccf905bc',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '271dd08d-99fd-4eb3-a4b6-b5093a9c77e7',
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
