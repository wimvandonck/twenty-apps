import { escapeHtml } from 'src/utils/escape-html.util';

// The HTML to paste into any website: an iframe plus a listener that keeps
// its height in step with the form.
export const buildEmbedSnippet = (formUrl: string, title: string): string => {
  const origin = new URL(formUrl).origin;

  return `<iframe src="${escapeHtml(formUrl)}" title="${escapeHtml(title || 'Form')}" style="width:100%;border:0" height="600"></iframe>
<script>
window.addEventListener('message', function (event) {
  if (event.origin !== ${JSON.stringify(origin)} || !event.data || event.data.type !== 'twenty-form-height') return;
  document.querySelectorAll('iframe[src=${JSON.stringify(formUrl)}]').forEach(function (frame) {
    frame.height = event.data.height;
  });
});
</script>`;
};
