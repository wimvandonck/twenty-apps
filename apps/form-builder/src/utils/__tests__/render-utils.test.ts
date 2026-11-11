import { describe, expect, it } from 'vitest';

import { buildEmbedSnippet } from 'src/utils/build-embed-snippet.util';
import { escapeHtml } from 'src/utils/escape-html.util';
import { getFormSteps } from 'src/utils/get-form-steps.util';
import { renderFormHtml } from 'src/utils/render-form-html.util';

import { getPublicFormMessages } from 'src/utils/get-public-form-messages.util';

import { DEFINITION, NEWSLETTER } from './fixtures';

const [PERSON_RECORD, COMPANY_RECORD] = DEFINITION.records;
const BREAK = { name: 'pageBreak1', label: 'Your company', type: 'PAGE_BREAK' as const, required: false };

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

describe('getFormSteps', () => {
  it('splits at page breaks and ignores breaks that leave a step empty', () => {
    const steps = getFormSteps({
      records: [
        { ...PERSON_RECORD, fields: [{ ...BREAK, label: 'About you' }, ...PERSON_RECORD.fields, BREAK] },
        { ...COMPANY_RECORD, fields: [...COMPANY_RECORD.fields, { ...BREAK, label: 'Nothing' }] },
      ],
    });

    expect(steps.map(({ title, sections }) => [title, sections.map(({ fields }) => fields.map(({ name }) => name))])).toEqual([
      ['About you', [['name', 'emails']]],
      ['Your company', [['name']]],
    ]);
    expect(getFormSteps(DEFINITION)).toHaveLength(1);
    expect(getFormSteps({ records: [{ ...COMPANY_RECORD, fields: [BREAK] }] })).toEqual([]);
  });
});

describe('renderFormHtml steps, lists and defaults', () => {
  it('renders one block per step and the list box in the last one', () => {
    const html = renderFormHtml(
      {
        ...DEFINITION,
        records: [{ ...PERSON_RECORD, fields: [...PERSON_RECORD.fields, BREAK] }, COMPANY_RECORD],
        lists: [
          { ...NEWSLETTER, optIn: true, checked: true, label: 'Keep me <posted>' },
          { ...NEWSLETTER, key: 'list2' },
        ],
      },
      MESSAGES,
    );

    expect(html.split('<div class="step" data-step>')).toHaveLength(3);
    expect(html).toContain('<h2 class="step-title">Your company</h2>');
    expect(html).toContain('data-list="list1" checked><span>Keep me &lt;posted&gt;</span></label></div></div>');
    expect(html).not.toContain('data-list="list2"');
    expect(html).toContain('data-step-label="Step {current} of {total}"');
  });

  it('prefills the parts of composite fields and leaves dates to the page script', () => {
    const html = renderFormHtml(
      {
        ...DEFINITION,
        records: [
          {
            ...COMPANY_RECORD,
            fields: [
              { name: 'contact', label: 'Contact', type: 'FULL_NAME', required: false, defaultValue: { firstName: 'Ada' } },
              { name: 'arr', label: 'ARR', type: 'CURRENCY', required: false, defaultValue: { amount: '5', currencyCode: 'USD' } },
              { name: 'day', label: 'Day', type: 'DATE', required: false, defaultValue: 'today' },
              { name: 'fixed', label: 'Fixed', type: 'DATE', required: false, defaultValue: '2026-01-02' },
              { name: 'seenAt', label: 'Seen', type: 'DATE_TIME', required: false, defaultValue: '2026-01-02T03:04:00.000Z' },
            ],
          },
        ],
        links: [],
      },
      MESSAGES,
    );

    expect(html).toContain('data-part="firstName" value="Ada"');
    expect(html).toContain('data-part="amount" step="any" value="5"');
    expect(html).toContain('<option value="USD" selected>');
    expect(html).toContain('data-field="day" data-default="today"');
    expect(html).toContain('data-field="fixed" value="2026-01-02"');
    expect(html).toContain('data-kind="datetime" data-default="2026-01-02T03:04:00.000Z"');
  });
});

describe('buildEmbedSnippet', () => {
  it('embeds the form URL and only trusts its origin', () => {
    const snippet = buildEmbedSnippet('https://acme.example.com/forms/123', 'Contact');

    expect(snippet).toContain('<iframe src="https://acme.example.com/forms/123" title="Contact"');
    expect(snippet).toContain('event.origin !== "https://acme.example.com"');
  });
});
