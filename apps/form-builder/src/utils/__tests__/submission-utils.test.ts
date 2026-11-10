import { describe, expect, it, vi } from 'vitest';

import { type RecordApi } from 'src/types/record-api';
import { buildMatchFilter } from 'src/utils/build-match-filter.util';
import { buildRecordData } from 'src/utils/build-record-data.util';
import { parseFormDefinition } from 'src/utils/parse-form-definition.util';
import { processSubmission } from 'src/utils/process-submission.util';
import { sortRecordsByLinks } from 'src/utils/sort-records-by-links.util';
import { toFieldValue } from 'src/utils/to-field-value.util';

import { getPublicFormMessages } from 'src/utils/get-public-form-messages.util';

import { DEFINITION, NOTE_LINK, NOTE_RECORD } from './fixtures';

const { messages: MESSAGES } = getPublicFormMessages(undefined, undefined);

const [PERSON_RECORD, COMPANY_RECORD] = DEFINITION.records;
const VALUES = {
  person: { name: { firstName: 'Ada', lastName: 'Lovelace' }, emails: 'Ada@Example.com' },
  company: { name: 'Analytical Engines' },
};

const createApi = (overrides: Partial<RecordApi> = {}): RecordApi => ({
  findIdByFilter: vi.fn(async () => null),
  create: vi.fn(async (objectNamePlural: string) => `${objectNamePlural}-id`),
  update: vi.fn(async () => undefined),
  remove: vi.fn(async () => undefined),
  ...overrides,
});

describe('parseFormDefinition', () => {
  it('accepts a valid definition unchanged', () => {
    expect(parseFormDefinition(JSON.parse(JSON.stringify(DEFINITION)))).toEqual(DEFINITION);
  });

  it('rejects missing, empty and malformed definitions', () => {
    expect(parseFormDefinition(null)).toBeNull();
    expect(parseFormDefinition({ records: [] })).toBeNull();
    expect(parseFormDefinition({ records: [{ ...PERSON_RECORD, objectNamePlural: 'people/../x' }] })).toBeNull();
    expect(parseFormDefinition({ records: [PERSON_RECORD, PERSON_RECORD] })).toBeNull();
    expect(
      parseFormDefinition({ records: [{ ...PERSON_RECORD, fields: [{ name: 'x', type: 'ACTOR' }] }] }),
    ).toBeNull();
    expect(
      parseFormDefinition({ records: [PERSON_RECORD], links: [{ ...DEFINITION.links[0] }] }),
    ).toBeNull();
  });

  it('gives links without a kind the DIRECT kind and accepts junction links', () => {
    const legacyLink = { ...DEFINITION.links[0], kind: undefined };
    const parsed = parseFormDefinition({
      records: [...DEFINITION.records, NOTE_RECORD],
      links: [legacyLink, NOTE_LINK],
    });

    expect(parsed?.links).toEqual([DEFINITION.links[0], NOTE_LINK]);
  });

  it('keeps defaults and never hides a required field without one', () => {
    const parsed = parseFormDefinition({
      records: [
        {
          ...COMPANY_RECORD,
          fields: [
            { name: 'a', type: 'TEXT', hidden: true, defaultValue: 'x' },
            { name: 'b', type: 'TEXT', hidden: true, required: true },
            { name: 'd', type: 'TEXT', hidden: true },
            { name: 'c', type: 'FULL_NAME', defaultValue: 'x' },
          ],
        },
      ],
    });

    expect(parsed?.records[0].fields.map(({ hidden, defaultValue }) => ({ hidden, defaultValue }))).toEqual([
      { hidden: true, defaultValue: 'x' },
      { hidden: undefined, defaultValue: undefined },
      { hidden: true, defaultValue: undefined },
      { hidden: undefined, defaultValue: undefined },
    ]);
  });

  it('falls back to CREATE when the match field is not in the form', () => {
    const parsed = parseFormDefinition({ records: [{ ...PERSON_RECORD, matchFieldName: 'missing' }] });

    expect(parsed?.records[0].mode).toBe('CREATE');
  });
});

describe('toFieldValue', () => {
  const convert = (type: Parameters<typeof toFieldValue>[0]['type'], raw: unknown, options?: string[]) =>
    toFieldValue(
      { name: 'f', label: 'F', type, required: false, options: options?.map((value) => ({ value, label: value })) },
      raw,
    );

  it('converts each type to the stored shape', () => {
    expect(convert('TEXT', '  hi ')).toEqual({ status: 'VALID', value: 'hi' });
    expect(convert('NUMBER', '4.5')).toEqual({ status: 'VALID', value: 4.5 });
    expect(convert('BOOLEAN', true)).toEqual({ status: 'VALID', value: true });
    expect(convert('DATE', '2026-11-10')).toEqual({ status: 'VALID', value: '2026-11-10' });
    expect(convert('DATE_TIME', '2026-11-10T10:00:00.000Z')).toEqual({ status: 'VALID', value: '2026-11-10T10:00:00.000Z' });
    expect(convert('SELECT', 'A', ['A', 'B'])).toEqual({ status: 'VALID', value: 'A' });
    expect(convert('MULTI_SELECT', ['A', 'B'], ['A', 'B'])).toEqual({ status: 'VALID', value: ['A', 'B'] });
    expect(convert('EMAILS', 'A@B.co')).toEqual({ status: 'VALID', value: { primaryEmail: 'a@b.co' } });
    expect(convert('RICH_TEXT', 'x')).toEqual({ status: 'VALID', value: { markdown: 'x' } });
    expect(convert('CURRENCY', { amount: '12.5', currencyCode: 'EUR' })).toEqual({
      status: 'VALID',
      value: { amountMicros: 12_500_000, currencyCode: 'EUR' },
    });
    expect(convert('ADDRESS', { street: 'Main 1', city: 'Gent' })).toEqual({
      status: 'VALID',
      value: { addressStreet1: 'Main 1', addressCity: 'Gent', addressPostcode: '', addressCountry: '' },
    });
  });

  it('reports empty and invalid values', () => {
    expect(convert('TEXT', '  ').status).toBe('EMPTY');
    expect(convert('TEXT', { nested: true }).status).toBe('EMPTY');
    expect(convert('BOOLEAN', false).status).toBe('EMPTY');
    expect(convert('FULL_NAME', {}).status).toBe('EMPTY');
    expect(convert('NUMBER', 'abc').status).toBe('INVALID');
    expect(convert('EMAILS', 'nope').status).toBe('INVALID');
    expect(convert('SELECT', 'C', ['A']).status).toBe('INVALID');
    expect(convert('MULTI_SELECT', ['A', 'C'], ['A']).status).toBe('INVALID');
    expect(convert('DATE', '10/11/2026').status).toBe('INVALID');
    expect(convert('CURRENCY', { amount: '1', currencyCode: 'XXX' }).status).toBe('INVALID');
  });
});

describe('buildRecordData', () => {
  it('ignores values for fields that are not in the form', () => {
    const { data, errors } = buildRecordData(COMPANY_RECORD, { name: 'Acme', accountOwnerId: 'x', id: 'y' }, MESSAGES);

    expect(data).toEqual({ name: 'Acme' });
    expect(errors).toEqual([]);
  });

  it('writes the default of a hidden field, whatever was posted', () => {
    const record = {
      ...COMPANY_RECORD,
      fields: [
        ...COMPANY_RECORD.fields,
        { name: 'source', label: 'Source', type: 'TEXT' as const, required: true, hidden: true, defaultValue: 'Website' },
      ],
    };

    expect(buildRecordData(record, { name: 'Acme', source: 'Hacked' }, MESSAGES).data).toEqual({
      name: 'Acme',
      source: 'Website',
    });
  });

  it('reports missing required and invalid values', () => {
    expect(buildRecordData(PERSON_RECORD, {}, MESSAGES).errors).toEqual(['Email is required']);
    expect(buildRecordData(PERSON_RECORD, { emails: 'x' }, MESSAGES).errors).toEqual(['Email must be an email address']);
  });
});

describe('buildMatchFilter', () => {
  it('builds a filter for upserts only, and never with unsafe values', () => {
    expect(buildMatchFilter(PERSON_RECORD, { emails: { primaryEmail: 'a@b.co' } })).toBe('emails.primaryEmail[eq]:"a@b.co"');
    expect(buildMatchFilter(PERSON_RECORD, {})).toBeNull();
    expect(buildMatchFilter(COMPANY_RECORD, { name: 'Acme' })).toBeNull();
    expect(
      buildMatchFilter({ ...COMPANY_RECORD, mode: 'UPSERT', matchFieldName: 'name' }, { name: 'a",id[neq]:"' }),
    ).toBeNull();
  });
});

describe('sortRecordsByLinks', () => {
  it('puts link targets first and detects loops', () => {
    expect(sortRecordsByLinks(DEFINITION.records, DEFINITION.links)?.map(({ key }) => key)).toEqual(['company', 'person']);
    expect(
      sortRecordsByLinks(DEFINITION.records, [
        ...DEFINITION.links,
        { kind: 'DIRECT', sourceRecordKey: 'company', relationFieldName: 'x', joinColumnName: 'xId', targetRecordKey: 'person' },
      ]),
    ).toBeNull();
  });
});

describe('processSubmission', () => {
  it('creates the target first and links the source to it', async () => {
    const api = createApi();

    expect(await processSubmission(DEFINITION, VALUES, api, MESSAGES)).toEqual({ ok: true });
    expect(api.create).toHaveBeenNthCalledWith(1, 'companies', { name: 'Analytical Engines' });
    expect(api.create).toHaveBeenNthCalledWith(2, 'people', {
      name: { firstName: 'Ada', lastName: 'Lovelace' },
      emails: { primaryEmail: 'ada@example.com' },
      companyId: 'companies-id',
    });
  });

  it('updates the matching record instead of creating one', async () => {
    const api = createApi({ findIdByFilter: vi.fn(async () => 'existing') });

    await processSubmission(DEFINITION, VALUES, api, MESSAGES);

    expect(api.findIdByFilter).toHaveBeenCalledWith('people', 'emails.primaryEmail[eq]:"ada@example.com"');
    expect(api.update).toHaveBeenCalledWith('people', 'existing', expect.objectContaining({ companyId: 'companies-id' }));
    expect(api.create).toHaveBeenCalledTimes(1);
  });

  it('creates the junction record after both records exist', async () => {
    const api = createApi();
    const definition = { ...DEFINITION, records: [...DEFINITION.records, NOTE_RECORD], links: [...DEFINITION.links, NOTE_LINK] };

    await processSubmission(definition, { ...VALUES, note: { title: 'Hello' } }, api, MESSAGES);

    expect(api.create).toHaveBeenLastCalledWith('noteTargets', { noteId: 'notes-id', targetPersonId: 'people-id' });
  });

  it('writes nothing when validation fails', async () => {
    const api = createApi();
    const result = await processSubmission(DEFINITION, { person: {}, company: {} }, api, MESSAGES);

    expect(result).toEqual({ ok: false, status: 422, errors: ['Company name is required', 'Email is required'] });
    expect(api.create).not.toHaveBeenCalled();
  });

  it('removes created records when a later write fails', async () => {
    const api = createApi({
      create: vi.fn(async (objectNamePlural: string) => {
        if (objectNamePlural === 'people') throw new Error('boom');

        return 'company-id';
      }),
    });
    const result = await processSubmission(DEFINITION, VALUES, api, MESSAGES);

    expect(result).toMatchObject({ ok: false, status: 500 });
    expect(api.remove).toHaveBeenCalledWith('companies', 'company-id');
  });
});

describe('getPublicFormMessages', () => {
  it('prefers the explicit language, then the browser, then English', () => {
    expect(getPublicFormMessages('nl-NL', 'fr-FR').locale).toBe('nl-NL');
    expect(getPublicFormMessages(undefined, 'xx,fr-CA;q=0.9,en;q=0.8').locale).toBe('fr-FR');
    expect(getPublicFormMessages('<script>', 'zz').locale).toBe('en');
    expect(getPublicFormMessages(undefined, 'nl').messages.required).toContain('{label}');
  });
});
