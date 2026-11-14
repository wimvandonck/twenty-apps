import { describe, expect, it, vi } from 'vitest';

import { type FormField } from 'src/types/form-field';
import { type RecordApi } from 'src/types/record-api';
import { buildRecordData } from 'src/utils/build-record-data.util';
import { getPublicFormMessages } from 'src/utils/get-public-form-messages.util';
import { isSelectableField } from 'src/utils/is-selectable-field.util';
import { loadRelationOptions } from 'src/utils/load-relation-options.util';
import { parseFormDefinition } from 'src/utils/parse-form-definition.util';
import { recordLabel } from 'src/utils/record-label.util';
import { renderFieldHtml } from 'src/utils/render-field-html.util';
import { toFormField } from 'src/utils/to-form-field.util';

import { DEFINITION, field, PERSON } from './fixtures';

const { messages: MESSAGES } = getPublicFormMessages(undefined, undefined);
const EVENT_ID = '5f0e4a8e-7b1d-4c55-9a8e-3c2d1b0a9f87';
const EVENT_FIELD: FormField = {
  name: 'organizedEvent',
  label: 'Event',
  type: 'RELATION',
  required: true,
  relation: { targetObjectNamePlural: 'organizedEvents', joinColumnName: 'organizedEventId' },
};
const EVENT_METADATA = field({
  name: 'organizedEvent',
  label: 'Event',
  type: 'RELATION',
  relationType: 'MANY_TO_ONE',
  joinColumnName: 'organizedEventId',
  relationTargetObjectNameSingular: 'organizedEvent',
});
const OBJECTS = [
  PERSON,
  { nameSingular: 'organizedEvent', namePlural: 'organizedEvents', labelSingular: 'Event', labelPlural: 'Events', isSelectable: true, fields: [] },
];

describe('relation fields in the builder', () => {
  it('offers many-to-one relations, not one-to-many ones', () => {
    expect(isSelectableField(EVENT_METADATA)).toBe(true);
    expect(isSelectableField(field({ name: 'notes', type: 'RELATION', relationType: 'ONE_TO_MANY' }))).toBe(false);
  });

  it('turns a relation into a field that knows where to look', () => {
    expect(toFormField(EVENT_METADATA, OBJECTS)).toMatchObject({
      type: 'RELATION',
      relation: { targetObjectNamePlural: 'organizedEvents', joinColumnName: 'organizedEventId' },
    });
  });
});

describe('relation fields in the definition', () => {
  it('keeps a valid relation field and rejects one without a target', () => {
    const record = { ...DEFINITION.records[0], fields: [...DEFINITION.records[0].fields, EVENT_FIELD] };

    expect(parseFormDefinition({ ...DEFINITION, records: [record, DEFINITION.records[1]] })?.records[0].fields.slice(-1)[0]).toEqual(
      EVENT_FIELD,
    );

    const broken = { ...record, fields: [...DEFINITION.records[0].fields, { ...EVENT_FIELD, relation: undefined }] };

    expect(parseFormDefinition({ ...DEFINITION, records: [broken, DEFINITION.records[1]] })).toBeNull();
  });
});

describe('loadRelationOptions', () => {
  it('fills the choices of relation fields from Twenty', async () => {
    const loader = vi.fn(async () => [
      { id: EVENT_ID, name: 'Spring walk' },
      { id: 'b', name: { firstName: 'Ada', lastName: 'Lovelace' } },
    ]);
    const record = { ...DEFINITION.records[0], fields: [EVENT_FIELD] };
    const loaded = await loadRelationOptions({ ...DEFINITION, records: [record] }, loader);

    expect(loader).toHaveBeenCalledWith('organizedEvents');
    expect(loaded.records[0].fields[0].options).toEqual([
      { value: 'b', label: 'Ada Lovelace' },
      { value: EVENT_ID, label: 'Spring walk' },
    ]);
  });

  it('never loads or offers people or payments, even in a form saved before they were refused', async () => {
    const loader = vi.fn(async () => [{ id: EVENT_ID, name: 'Someone' }]);
    const toPayments = { ...EVENT_FIELD, relation: { targetObjectNamePlural: 'payments', joinColumnName: 'paymentId' } };
    const loaded = await loadRelationOptions({ ...DEFINITION, records: [{ ...DEFINITION.records[0], fields: [toPayments] }] }, loader);

    expect(loader).not.toHaveBeenCalled();
    expect(loaded.records[0].fields[0].options).toEqual([]);
  });
});

describe('recordLabel', () => {
  it('uses the name, a full name, a title or the id', () => {
    expect(recordLabel({ id: '1', name: 'X' })).toBe('X');
    expect(recordLabel({ id: '1', name: { firstName: 'A', lastName: 'B' } })).toBe('A B');
    expect(recordLabel({ id: '1', title: 'T' })).toBe('T');
    expect(recordLabel({ id: '1' })).toBe('1');
  });
});

describe('relation values', () => {
  const loadedField = { ...EVENT_FIELD, options: [{ value: EVENT_ID, label: 'Spring walk' }] };
  const record = { ...DEFINITION.records[0], fields: [loadedField] };

  it('writes a chosen record to the join column', () => {
    expect(buildRecordData(record, { organizedEvent: EVENT_ID }, MESSAGES)).toEqual({
      data: { organizedEventId: EVENT_ID },
      errors: [],
    });
  });

  it('refuses a record that is not one of the choices', () => {
    expect(buildRecordData(record, { organizedEvent: 'other' }, MESSAGES).errors).toHaveLength(1);
  });

  it('writes the default of a hidden relation field', () => {
    const hidden = { ...record, fields: [{ ...loadedField, hidden: true, defaultValue: EVENT_ID }] };

    expect(buildRecordData(hidden, {}, MESSAGES).data).toEqual({ organizedEventId: EVENT_ID });
  });

  it('renders as a choice list', () => {
    expect(renderFieldHtml('registration', loadedField, MESSAGES)).toContain(`<option value="${EVENT_ID}">Spring walk</option>`);
  });
});

void ({} as RecordApi);
