import { type FormDefinition } from 'src/types/form-definition';
import { type PickerChoice } from 'src/types/picker-choice';
import { type RelationRecordLoader } from 'src/types/relation-record-loader';
import { recordLabel } from 'src/utils/record-label.util';

type Money = { amountMicros?: number | null; currencyCode?: string | null };

// The REST filter for a picker's equality filters.
export const buildPickerFilter = (filters: Array<{ fieldName: string; value: string | boolean }>): string | undefined =>
  filters.length === 0
    ? undefined
    : filters
        .map(({ fieldName, value }) => `${fieldName}[eq]:${typeof value === 'boolean' ? value : JSON.stringify(value)}`)
        .join(',');

// The records every picker offers now, with their prices, sorted by name.
export const loadPickerChoices = async (
  definition: FormDefinition,
  loader: RelationRecordLoader,
): Promise<Map<string, PickerChoice[]>> =>
  new Map(
    await Promise.all(
      definition.pickers.map(async (picker) => {
        const records = await loader(picker.source.objectNamePlural, buildPickerFilter(picker.source.filters));
        const choices = records
          .map((record): PickerChoice => {
            const price = (picker.source.priceFieldName ? record[picker.source.priceFieldName] : null) as Money | null;
            const priceMicros = typeof price?.amountMicros === 'number' ? price.amountMicros : null;

            return {
              id: record.id,
              label: recordLabel(record),
              priceMicros,
              currencyCode: priceMicros === null ? null : (price?.currencyCode ?? null),
              record,
            };
          })
          .sort((a, b) => a.label.localeCompare(b.label));

        return [picker.key, choices] as const;
      }),
    ),
  );
