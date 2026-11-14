import { type FormDefinition } from 'src/types/form-definition';
import { type RecordByIdLoader } from 'src/types/record-by-id-loader';
import { recordLabel } from 'src/utils/record-label.util';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A visible relation only accepts the records the form lists. A hidden
// field's default, set by the form's author, may point at any record that
// exists: it is looked up by id and added to the valid choices.
export const addChosenRelations = async (
  definition: FormDefinition,
  fetchById: RecordByIdLoader,
): Promise<FormDefinition> => ({
  ...definition,
  records: await Promise.all(
    definition.records.map(async (record) => ({
      ...record,
      fields: await Promise.all(
        record.fields.map(async (field) => {
          if (!field.relation || !field.hidden) {
            return field;
          }

          const raw = field.defaultValue;
          const id = typeof raw === 'string' ? raw.trim() : '';

          if (!UUID.test(id) || (field.options ?? []).some(({ value }) => value === id)) {
            return field;
          }

          const found = await fetchById(field.relation.targetObjectNamePlural, id);

          return found ? { ...field, options: [...(field.options ?? []), { value: found.id, label: recordLabel(found) }] } : field;
        }),
      ),
    })),
  ),
});
