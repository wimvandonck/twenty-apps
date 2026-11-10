import { describe, expect, it } from 'vitest';

import { createFormRecord } from 'src/utils/create-form-record.util';
import { enforceRequiredFields } from 'src/utils/enforce-required-fields.util';
import { getAvailableLinks } from 'src/utils/get-available-links.util';
import { getBlockingFields } from 'src/utils/get-blocking-fields.util';
import { isRequiredField } from 'src/utils/is-required-field.util';
import { isSelectableField } from 'src/utils/is-selectable-field.util';
import { normalizeDefinition } from 'src/utils/normalize-definition.util';

import { COMPANY, DEFINITION, field, PERSON } from './fixtures';

describe('isSelectableField', () => {
  it('excludes system, read-only, inactive and unsupported fields', () => {
    expect(PERSON.fields.filter(isSelectableField).map(({ name }) => name)).toEqual(['name', 'emails', 'nickname']);
    expect(isSelectableField(field({ name: 'a', isUIReadOnly: true }))).toBe(false);
    expect(isSelectableField(field({ name: 'a', isActive: false }))).toBe(false);
  });
});

describe('isRequiredField', () => {
  it('is true only for non-nullable fields without a default', () => {
    expect(isRequiredField(field({ name: 'a', isNullable: false }))).toBe(true);
    expect(isRequiredField(field({ name: 'a', isNullable: false, defaultValue: "'NEW'" }))).toBe(false);
    expect(isRequiredField(field({ name: 'a' }))).toBe(false);
  });
});

describe('createFormRecord', () => {
  it('starts with the required fields and numbers duplicate keys', () => {
    const record = createFormRecord(PERSON, ['person']);

    expect(record.key).toBe('person2');
    expect(record.label).toBe('Person 2');
    expect(record.fields).toEqual([{ name: 'nickname', label: 'Nickname', type: 'TEXT', required: true }]);
  });
});

describe('enforceRequiredFields', () => {
  it('adds required and match fields, keeps custom labels and drops stale fields', () => {
    const record = enforceRequiredFields(
      {
        ...DEFINITION.records[0],
        fields: [
          { name: 'emails', label: 'Work email', type: 'EMAILS', required: false },
          { name: 'gone', label: 'Gone', type: 'TEXT', required: false },
        ],
      },
      PERSON,
    );

    expect(record.fields).toEqual([
      { name: 'emails', label: 'Work email', type: 'EMAILS', required: true },
      { name: 'nickname', label: 'Nickname', type: 'TEXT', required: true },
    ]);
  });
});

describe('getBlockingFields', () => {
  it('lists required fields a form cannot fill', () => {
    const object = { ...COMPANY, fields: [field({ name: 'payload', type: 'RAW_JSON', isNullable: false })] };

    expect(getBlockingFields(object).map(({ name }) => name)).toEqual(['payload']);
    expect(getBlockingFields(PERSON)).toEqual([]);
  });
});

describe('getAvailableLinks', () => {
  it('offers many-to-one relations between records of the form', () => {
    expect(getAvailableLinks(DEFINITION.records, [PERSON, COMPANY])).toEqual(DEFINITION.links);
    expect(getAvailableLinks([DEFINITION.records[0]], [PERSON, COMPANY])).toEqual([]);
  });
});

describe('normalizeDefinition', () => {
  it('drops links whose record was removed', () => {
    const normalized = normalizeDefinition({ ...DEFINITION, records: [DEFINITION.records[0]] }, [PERSON, COMPANY]);

    expect(normalized.links).toEqual([]);
  });
});
