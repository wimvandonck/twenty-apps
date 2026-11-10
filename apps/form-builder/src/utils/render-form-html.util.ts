import { FORM_PAGE_SCRIPT } from 'src/constants/form-page-script';
import { type FormDefinition } from 'src/types/form-definition';
import { escapeHtml } from 'src/utils/escape-html.util';
import { renderFieldHtml } from 'src/utils/render-field-html.util';
import { renderPageHtml } from 'src/utils/render-page-html.util';

// The complete public page for a form definition.
export const renderFormHtml = (definition: FormDefinition): string => {
  const sections = definition.records
    .filter(({ fields }) => fields.length > 0)
    .map(
      (record) =>
        `<section>${definition.records.length > 1 ? `<h2>${escapeHtml(record.label)}</h2>` : ''}${record.fields
          .map((field) => renderFieldHtml(record.key, field))
          .join('')}</section>`,
    )
    .join('');

  return renderPageHtml(
    definition.title,
    `${definition.title ? `<h1>${escapeHtml(definition.title)}</h1>` : ''}${
      definition.description ? `<p>${escapeHtml(definition.description)}</p>` : ''
    }<form data-success="${escapeHtml(definition.successMessage)}">${sections}<div class="trap" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div><button type="submit">${escapeHtml(
      definition.submitLabel,
    )}</button></form><div id="message" class="message" role="status" hidden></div><script>${FORM_PAGE_SCRIPT}</script>`,
  );
};
