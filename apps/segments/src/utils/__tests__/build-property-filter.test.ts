import { describe, expect, it } from 'vitest';

import { buildPropertyFilter, operatorsFor } from 'src/utils/build-property-filter.util';
import { measurableFields, personLinks } from 'src/utils/person-links.util';
import { type EditorObject } from 'src/types/editor-metadata';

describe('buildPropertyFilter', () => {
  it('searches text and composite fields case-insensitively', () => {
    expect(buildPropertyFilter('jobTitle', 'TEXT', 'CONTAINS', 'volunteer')).toEqual({ jobTitle: { ilike: '%volunteer%' } });
    expect(buildPropertyFilter('emails', 'EMAILS', 'IS', 'an@example.org')).toEqual({
      emails: { primaryEmail: { ilike: 'an@example.org' } },
    });
    expect(buildPropertyFilter('address', 'ADDRESS', 'CONTAINS', 'Brussel')).toEqual({
      address: { addressCity: { ilike: '%Brussel%' } },
    });
  });

  it('types numbers, booleans and choices', () => {
    expect(buildPropertyFilter('age', 'NUMBER', 'GTE', '30')).toEqual({ age: { gte: 30 } });
    expect(buildPropertyFilter('isVip', 'BOOLEAN', 'IS', 'false')).toEqual({ isVip: { eq: false } });
    expect(buildPropertyFilter('stage', 'SELECT', 'IS_NOT', 'LEAD')).toEqual({ stage: { neq: 'LEAD' } });
    expect(buildPropertyFilter('tags', 'MULTI_SELECT', 'CONTAINS', 'VIP')).toEqual({ tags: { containsAny: ['VIP'] } });
  });

  it('tests for empty values', () => {
    expect(buildPropertyFilter('phones', 'PHONES', 'IS_EMPTY', '')).toEqual({ phones: { primaryPhoneNumber: { is: 'NULL' } } });
    expect(buildPropertyFilter('birthday', 'DATE', 'IS_NOT_EMPTY', '')).toEqual({ birthday: { is: 'NOT_NULL' } });
  });

  it('offers operators that fit the field', () => {
    expect(operatorsFor('BOOLEAN')).toEqual(['IS']);
    expect(operatorsFor('RICH_TEXT')).toEqual([]);
  });
});

const field = (name: string, type: string, relationTarget: string | null = null) => ({
  name,
  label: name,
  type,
  options: null,
  relationTarget,
});
const object = (nameSingular: string, labelPlural: string, fields: ReturnType<typeof field>[]): EditorObject => ({
  id: nameSingular,
  nameSingular,
  namePlural: `${nameSingular}s`,
  labelSingular: nameSingular,
  labelPlural,
  fields,
});

describe('personLinks', () => {
  it('finds every field that points at a person', () => {
    const links = personLinks([
      object('person', 'People', [field('company', 'RELATION', 'company')]),
      object('donation', 'Donations', [field('donor', 'RELATION', 'person'), field('campaign', 'RELATION', 'campaign')]),
      object('registration', 'Registrations', [field('attendee', 'RELATION', 'person'), field('bookedBy', 'RELATION', 'person')]),
    ]);

    expect(links.map((link) => `${link.object.nameSingular}.${link.relation.name}`)).toEqual([
      'donation.donor',
      'registration.attendee',
      'registration.bookedBy',
    ]);
  });
});

describe('measurableFields', () => {
  const donation = object('donation', 'Donations', [
    field('amount', 'CURRENCY'),
    field('receivedOn', 'DATE'),
    field('note', 'TEXT'),
  ]);

  it('sums amounts and numbers, and compares dates only for highest and lowest', () => {
    expect(measurableFields(donation, 'SUM').map((f) => f.path)).toEqual(['amount.amountMicros']);
    expect(measurableFields(donation, 'MAX').map((f) => f.path)).toEqual(['amount.amountMicros', 'receivedOn']);
  });
});
