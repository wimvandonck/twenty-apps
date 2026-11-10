import {
  definePageLayout,
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
} from 'twenty-sdk/define';

import {
  FORM_BUILDER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  FORM_BUILDER_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: FORM_BUILDER_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Form builder',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: '99d233f9-011f-49dc-9f40-5e77b77828d1',
      title: 'Form builder',
      position: 0,
      icon: 'IconForms',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '6e66606b-d42b-40c4-a5cd-786997e2b6f6',
          title: ' ',
          type: 'FRONT_COMPONENT',
          heightBehavior:
            PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              FORM_BUILDER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
