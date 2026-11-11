import { describe, expect, it } from 'vitest';

import { buildEmbedSnippet } from 'src/utils/build-embed-snippet.util';
import { escapeHtml } from 'src/utils/escape-html.util';
import { renderFormHtml } from 'src/utils/render-form-html.util';

import { getPublicFormMessages } from 'src/utils/get-public-form-messages.util';

import { DEFINITION } from './fixtures';

const { messages: MESSAGES } = getPublicFormMessages(undefined, undefined);

describe('escapeHtml', () => {
  it('escapes the five special characters', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe('&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
  });
});

describe('renderFormHtml', () => {
  it('renders every field, marks required ones and includes the bot trap', () => {
    const html = renderFormHtml(DEFINITION, MESSAGES);

    expect(html).toContain('<h1>Contact us</h1>');
    expect(html).toContain('data-record="person" data-field="emails" required');
    expect(html).toContain('data-part="firstName"');
    expect(html).toContain('data-record="company" data-field="name" required');
    expect(html).toContain('name="website"');
    expect(html).toContain('>Send</button>');
  });

  it('prefills defaults and leaves hidden fields out', () => {
    const html = renderFormHtml(
      {
        ...DEFINITION,
        records: [
          {
            ...DEFINITION.records[1],
            fields: [
              { name: 'name', label: 'Company', type: 'TEXT', required: true, defaultValue: 'Acme "Inc"' },
              { name: 'source', label: 'Source', type: 'TEXT', required: false, defaultValue: 'Website', hidden: true },
            ],
          },
        ],
      },
      MESSAGES,
      'nl-NL',
    );

    expect(html).toContain('<html lang="nl-NL" dir="ltr">');
    expect(html).toContain('value="Acme &quot;Inc&quot;"');
    expect(html).not.toContain('data-field="source"');
  });

  it('escapes labels', () => {
    const html = renderFormHtml({ ...DEFINITION, title: '<script>alert(1)</script>' }, MESSAGES);

    expect(html).not.toContain('<script>alert(1)</script>');
  });
});

describe('buildEmbedSnippet', () => {
  it('embeds the form URL and only trusts its origin', () => {
    const snippet = buildEmbedSnippet('https://acme.example.com/forms/123', 'Contact');

    expect(snippet).toContain('<iframe src="https://acme.example.com/forms/123" title="Contact"');
    expect(snippet).toContain('event.origin !== "https://acme.example.com"');
  });
});
