import { FORM_PAGE_SCRIPT } from 'src/constants/form-page-script';
import { type FormDefinition } from 'src/types/form-definition';
import { type PublicFormMessages } from 'src/types/public-form-messages';
import { escapeHtml } from 'src/utils/escape-html.util';
import { renderFieldHtml } from 'src/utils/render-field-html.util';
import { renderPageHtml } from 'src/utils/render-page-html.util';

// The complete public page for a form definition.
export const renderFormHtml = (
  definition: FormDefinition,
  messages: PublicFormMessages,
  locale = 'en',
): string => {
  const visibleRecords = definition.records
    .map((record) => ({ ...record, fields: record.fields.filter(({ hidden }) => hidden !== true) }))
    .filter(({ fields }) => fields.length > 0);
  const sections = visibleRecords
    .map(
      (record) =>
        `<section>${visibleRecords.length > 1 ? `<h2>${escapeHtml(record.label)}</h2>` : ''}${record.fields
          .map((field) => renderFieldHtml(record.key, field, messages))
          .join('')}</section>`,
    )
    .join('');

  return renderPageHtml(
    definition.title,
    `${definition.title ? `<h1>${escapeHtml(definition.title)}</h1>` : ''}${
      definition.description ? `<p>${escapeHtml(definition.description)}</p>` : ''
    }<form data-success="${escapeHtml(definition.successMessage)}" data-generic-error="${escapeHtml(messages.genericError)}" data-network-error="${escapeHtml(messages.networkError)}">${sections}<div class="trap" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div><button type="submit">${escapeHtml(
      definition.submitLabel,
    )}</button></form><div id="message" class="message" role="status" hidden></div><script>${FORM_PAGE_SCRIPT}</script>`,
    locale,
  );
};
