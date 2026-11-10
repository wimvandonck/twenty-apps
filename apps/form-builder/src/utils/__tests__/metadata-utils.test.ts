import { describe, expect, it } from 'vitest';

import { createFormRecord } from 'src/utils/create-form-record.util';
import { enforceRequiredFields } from 'src/utils/enforce-required-fields.util';
import { describeLink } from 'src/utils/describe-link.util';
import { getLinkPaths } from 'src/utils/get-link-paths.util';
import { getBlockingFields } from 'src/utils/get-blocking-fields.util';
import { isRequiredField } from 'src/utils/is-required-field.util';
import { isSelectableField } from 'src/utils/is-selectable-field.util';
import { normalizeDefinition } from 'src/utils/normalize-definition.util';

import { replaceLink } from 'src/utils/replace-link.util';

import { COMPANY, DEFINITION, field, NOTE, NOTE_LINK, NOTE_RECORD, NOTE_TARGET, PERSON } from './fixtures';

const OBJECTS = [PERSON, COMPANY, NOTE, NOTE_TARGET];
const [PERSON_RECORD, COMPANY_RECORD] = DEFINITION.records;

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

describe('enforceRequiredFields settings', () => {
  it('keeps the default value and hidden flag of a field', () => {
    const record = enforceRequiredFields(
      {
        ...DEFINITION.records[0],
        fields: [{ name: 'nickname', label: 'Nick', type: 'TEXT', required: true, defaultValue: 'Web', hidden: true }],
      },
      PERSON,
    );

    expect(record.fields.find(({ name }) => name === 'nickname')).toEqual({
      name: 'nickname',
      label: 'Nick',
      type: 'TEXT',
      required: true,
      defaultValue: 'Web',
      hidden: true,
    });
  });
});

describe('getBlockingFields', () => {
  it('lists required fields a form cannot fill', () => {
    const object = { ...COMPANY, fields: [field({ name: 'payload', type: 'RAW_JSON', isNullable: false })] };

    expect(getBlockingFields(object).map(({ name }) => name)).toEqual(['payload']);
    expect(getBlockingFields(PERSON)).toEqual([]);
  });
});

describe('getLinkPaths', () => {
  it('finds a relation field in either direction', () => {
    expect(getLinkPaths(PERSON_RECORD, COMPANY_RECORD, OBJECTS)).toEqual(DEFINITION.links);
    expect(getLinkPaths(COMPANY_RECORD, PERSON_RECORD, OBJECTS)).toEqual(DEFINITION.links);
  });

  it('finds a junction object, with the morph join column of the target', () => {
    expect(getLinkPaths(PERSON_RECORD, NOTE_RECORD, OBJECTS)).toEqual([NOTE_LINK]);
  });

  it('returns nothing for unrelated objects or the same record', () => {
    expect(getLinkPaths(COMPANY_RECORD, { ...NOTE_RECORD, objectNameSingular: 'task' }, OBJECTS)).toEqual([]);
    expect(getLinkPaths(PERSON_RECORD, PERSON_RECORD, OBJECTS)).toEqual([]);
  });
});

describe('describeLink', () => {
  it('names the relation field or the junction object', () => {
    const records = [...DEFINITION.records, NOTE_RECORD];

    expect(describeLink(DEFINITION.links[0], records, OBJECTS)).toBe('Person → Company');
    expect(describeLink(NOTE_LINK, records, OBJECTS)).toBe('Note targets');
  });
});

describe('replaceLink', () => {
  it('appends, replaces in place, and drops links through the same field', () => {
    const [direct] = DEFINITION.links;
    const other = { ...direct, targetRecordKey: 'company2' };

    expect(replaceLink([direct], null, NOTE_LINK)).toEqual([direct, NOTE_LINK]);
    expect(replaceLink([direct, NOTE_LINK], 0, other)).toEqual([other, NOTE_LINK]);
    expect(replaceLink([direct], null, other)).toEqual([other]);
    expect(replaceLink([direct], null, direct)).toEqual([direct]);
  });
});

describe('normalizeDefinition', () => {
  it('drops links whose record was removed', () => {
    const normalized = normalizeDefinition({ ...DEFINITION, records: [DEFINITION.records[0]] }, OBJECTS);

    expect(normalized.links).toEqual([]);
  });
});
