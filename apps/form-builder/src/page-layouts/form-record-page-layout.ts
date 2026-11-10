import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

import {
  FORM_BUILDER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  FORM_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: 'd7721a93-0199-44ac-9c6c-2820b48ea79f',
  name: 'Default Form Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: FORM_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'd314575b-7f26-4371-8fb8-d85ec2478b8e',
      title: 'Builder',
      position: 5,
      icon: 'IconForms',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '7126383b-2b70-49ee-b684-a57af845bee2',
          title: 'Form builder',
          type: 'FRONT_COMPONENT',
          objectUniversalIdentifier: FORM_OBJECT_UNIVERSAL_IDENTIFIER,
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              FORM_BUILDER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '62ed042b-9636-4842-8586-70e9160da2f8',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'cca6695b-9b83-434e-b4ec-c0dd13622899',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: 'f8d73349-0ccb-414a-8e6f-77e81d86ebd9',
          },
        },
      ],
    },
    {
      universalIdentifier: 'e192f2f8-9893-4854-90f9-82d958a4d8fa',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'f67f1221-ae83-4692-8768-46ad37726146',
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
