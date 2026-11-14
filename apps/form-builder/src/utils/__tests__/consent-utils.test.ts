import { describe, expect, it, vi } from 'vitest';

import { type ConsentApi } from 'src/types/consent-api';
import { type RecordApi } from 'src/types/record-api';
import { getPublicFormMessages } from 'src/utils/get-public-form-messages.util';
import { parseFormDefinition } from 'src/utils/parse-form-definition.util';
import { processSubmission } from 'src/utils/process-submission.util';
import { renderFormHtml } from 'src/utils/render-form-html.util';

import { DEFINITION, NEWSLETTER, NEWSLETTER_CONSENT } from './fixtures';

const { messages: MESSAGES } = getPublicFormMessages(undefined, undefined);
const VALUES = {
  person: { name: { firstName: 'Ada', lastName: 'Lovelace' }, emails: 'Ada@Example.com' },
  company: { name: 'Analytical Engines' },
};
const CLIMATE = {
  ...NEWSLETTER,
  key: 'list2',
  listName: 'Climate',
  optIn: true,
  label: 'Keep me posted about climate',
  emailTypeId: NEWSLETTER_CONSENT.emailTypeId,
};

const createApi = (): RecordApi => ({
  findIdByFilter: vi.fn(async () => null),
  create: vi.fn(async (objectNamePlural: string) => `${objectNamePlural}-id`),
  update: vi.fn(async () => undefined),
  remove: vi.fn(async () => undefined),
});

const createConsentApi = (): ConsentApi & { record: ReturnType<typeof vi.fn> } => ({
  record: vi.fn(async () => undefined),
});

describe('consents in a submission', () => {
  it('requests consent for a ticked box with the text the visitor saw', async () => {
    const consentApi = createConsentApi();
    const definition = { ...DEFINITION, title: 'Sign up', consents: [NEWSLETTER_CONSENT] };

    expect(
      await processSubmission(definition, VALUES, createApi(), MESSAGES, {}, {
        consentApi,
        consents: { consent1: true },
        language: 'nl',
        visitor: { ipAddress: '1.2.3.4', userAgent: 'UA' },
      }),
    ).toEqual({ ok: true });
    expect(consentApi.record).toHaveBeenCalledWith({
      personId: 'people-id',
      changes: [
        {
          emailTypeId: NEWSLETTER_CONSENT.emailTypeId,
          action: 'REQUESTED',
          source: 'FORM',
          shownText: 'Yes, send me the newsletter',
          formName: 'Sign up',
          language: 'nl',
        },
      ],
      ipAddress: '1.2.3.4',
      userAgent: 'UA',
    });
  });

  it('requests nothing for an unticked box', async () => {
    const consentApi = createConsentApi();

    await processSubmission({ ...DEFINITION, consents: [NEWSLETTER_CONSENT] }, VALUES, createApi(), MESSAGES, {}, {
      consentApi,
      consents: { consent1: false },
    });

    expect(consentApi.record).not.toHaveBeenCalled();
  });

  it('refuses a required consent that is not ticked, before writing anything', async () => {
    const api = createApi();
    const result = await processSubmission(
      { ...DEFINITION, consents: [{ ...NEWSLETTER_CONSENT, required: true }] },
      VALUES,
      api,
      MESSAGES,
      {},
      { consentApi: createConsentApi(), consents: {} },
    );

    expect(result).toMatchObject({ ok: false, status: 422 });
    expect(api.create).not.toHaveBeenCalled();
  });

  it('asks consent for the email type a ticked list requires, once per type', async () => {
    const consentApi = createConsentApi();

    await processSubmission(
      { ...DEFINITION, lists: [CLIMATE], consents: [NEWSLETTER_CONSENT] },
      VALUES,
      createApi(),
      MESSAGES,
      { list2: true },
      { consentApi, consents: { consent1: true } },
    );

    expect(consentApi.record.mock.calls[0][0].changes).toHaveLength(1);

    const listOnly = createConsentApi();

    await processSubmission({ ...DEFINITION, lists: [CLIMATE] }, VALUES, createApi(), MESSAGES, { list2: true }, {
      consentApi: listOnly,
    });

    expect(listOnly.record.mock.calls[0][0].changes[0]).toMatchObject({
      emailTypeId: NEWSLETTER_CONSENT.emailTypeId,
      shownText: 'Keep me posted about climate',
    });
  });

  it('removes the records again when consent cannot be recorded', async () => {
    const api = createApi();
    const result = await processSubmission({ ...DEFINITION, consents: [NEWSLETTER_CONSENT] }, VALUES, api, MESSAGES, {}, {
      consentApi: { record: vi.fn(async () => Promise.reject(new Error('down'))) },
      consents: { consent1: true },
    });

    expect(result).toMatchObject({ ok: false, status: 500 });
    expect(api.remove).toHaveBeenCalled();
  });
});

describe('consents in the definition', () => {
  it('keeps valid consents and drops none', () => {
    expect(parseFormDefinition({ ...DEFINITION, consents: [NEWSLETTER_CONSENT] })?.consents).toEqual([NEWSLETTER_CONSENT]);
    expect(parseFormDefinition({ ...DEFINITION, consents: undefined })?.consents).toEqual([]);
  });

  it('rejects a consent on a record that is not a person, or with a bad id', () => {
    expect(parseFormDefinition({ ...DEFINITION, consents: [{ ...NEWSLETTER_CONSENT, recordKey: 'company' }] })).toBeNull();
    expect(parseFormDefinition({ ...DEFINITION, consents: [{ ...NEWSLETTER_CONSENT, emailTypeId: 'x' }] })).toBeNull();
  });

  it('keeps the email type a list requires', () => {
    expect(parseFormDefinition({ ...DEFINITION, lists: [CLIMATE] })?.lists[0].emailTypeId).toBe(NEWSLETTER_CONSENT.emailTypeId);
  });

  it('makes a list that requires consent opt-in, so nobody joins it without asking', () => {
    expect(parseFormDefinition({ ...DEFINITION, lists: [{ ...CLIMATE, optIn: false }] })?.lists[0].optIn).toBe(true);
  });
});

describe('consents on the page', () => {
  it('shows an unticked box per consent, required when asked', () => {
    const html = renderFormHtml({ ...DEFINITION, consents: [{ ...NEWSLETTER_CONSENT, required: true, label: 'Yes <please>' }] }, MESSAGES);

    expect(html).toMatch(/<input id="consent-consent1" type="checkbox" data-consent="consent1" required>/);
    expect(html).toContain('Yes &lt;please&gt;');
  });
});
