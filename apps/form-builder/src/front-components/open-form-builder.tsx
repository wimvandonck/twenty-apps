import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { defineFrontComponent } from 'twenty-sdk/define';
import { AppPath, Command, navigate, useSelectedRecordIds } from 'twenty-sdk/front-component';

import {
  FORM_BUILDER_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  OPEN_FORM_BUILDER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Opens the form builder page on the selected form. The page route needs the
// layout's id in this workspace, which is looked up by its universal identifier.
const OpenFormBuilder = () => {
  const selectedRecordIds = useSelectedRecordIds();

  const execute = async () => {
    const { getPageLayouts } = await new MetadataApiClient().query({
      getPageLayouts: { id: true, universalIdentifier: true },
    });
    const pageLayout = getPageLayouts.find(
      ({ universalIdentifier }) =>
        universalIdentifier === FORM_BUILDER_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
    );

    if (pageLayout === undefined) {
      throw new Error('The form builder page was not found');
    }

    await navigate(
      AppPath.PageLayoutPage,
      { pageLayoutId: pageLayout.id },
      selectedRecordIds.length === 1 ? { formId: selectedRecordIds[0] } : undefined,
    );
  };

  return <Command execute={execute} />;
};

export default defineFrontComponent({
  universalIdentifier: OPEN_FORM_BUILDER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'open-form-builder',
  description: 'Opens the selected form in the form builder',
  component: OpenFormBuilder,
  isHeadless: true,
});
