import { describe, expect, it, vi } from 'vitest';

import { type FormDefinition } from 'src/types/form-definition';
import { type FormField } from 'src/types/form-field';
import { addChosenRelations } from 'src/utils/add-chosen-relations.util';

import { DEFINITION } from './fixtures';

const EVENT_ID = '5f0e4a8e-7b1d-4c55-9a8e-3c2d1b0a9f87';
const OTHER_ID = '6a1e4a8e-7b1d-4c55-9a8e-3c2d1b0a9f88';
const field = (overrides: Partial<FormField> = {}): FormField => ({
  name: 'organizedEvent',
  label: 'Event',
  type: 'RELATION',
  required: true,
  relation: { targetObjectNamePlural: 'organizedEvents', joinColumnName: 'organizedEventId' },
  options: [{ value: OTHER_ID, label: 'Listed' }],
  ...overrides,
});
const definition = (fields: FormField[]): FormDefinition => ({
  ...DEFINITION,
  records: [{ ...DEFINITION.records[0], key: 'registration', fields }],
});

describe('addChosenRelations', () => {
  it('never adds a record the visitor chose that was not listed', async () => {
    const fetchById = vi.fn(async () => ({ id: EVENT_ID, name: 'Late event' }));
    const result = await addChosenRelations(definition([field()]), fetchById);

    expect(fetchById).not.toHaveBeenCalled();
    expect(result.records[0].fields[0].options).toEqual([{ value: OTHER_ID, label: 'Listed' }]);
  });

  it('checks the default of a hidden relation the same way', async () => {
    const fetchById = vi.fn(async () => ({ id: EVENT_ID, name: 'Fixed event' }));
    const result = await addChosenRelations(definition([field({ hidden: true, defaultValue: EVENT_ID })]), fetchById);

    expect(result.records[0].fields[0].options?.map(({ value }) => value)).toContain(EVENT_ID);
  });

  it('adds nothing for unknown records, malformed ids or listed choices', async () => {
    const fetchById = vi.fn(async () => null);
    const unknown = await addChosenRelations(definition([field({ hidden: true, defaultValue: EVENT_ID })]), fetchById);

    expect(unknown.records[0].fields[0].options).toHaveLength(1);

    const calls = vi.fn(async () => null);

    await addChosenRelations(definition([field({ hidden: true, defaultValue: 'not-an-id' })]), calls);
    await addChosenRelations(definition([field({ hidden: true, defaultValue: OTHER_ID })]), calls);
    expect(calls).not.toHaveBeenCalled();
  });
});
