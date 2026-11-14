import { useState } from 'react';
import { useTranslate } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { LightButton } from 'twenty-ui/components/input';
import { Button, Field, Input } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { CURRENCY_CODES } from 'src/constants/currency-codes';
import { LabelledCheckbox } from 'src/front-components/components/labelled-checkbox';
import { OptionSelect } from 'src/front-components/components/option-select';
import { type FormDefinition } from 'src/types/form-definition';
import { type FormPicker } from 'src/types/form-picker';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { type RelationRecordLoader } from 'src/types/relation-record-loader';
import { recordLabel } from 'src/utils/record-label.util';
import { suggestPayment } from 'src/utils/suggest-payment.util';
import { suggestPicker } from 'src/utils/suggest-picker.util';

type PickersSectionProps = {
  definition: FormDefinition;
  objects: ObjectMetadata[];
  loadRecords: RelationRecordLoader;
  onChange: (changes: Partial<FormDefinition>) => void;
};

const NONE = '__none__';

export const PickersSection = ({ definition, objects, loadRecords, onChange }: PickersSectionProps) => {
  const theme = useTheme();
  const { t } = useTranslate();
  const [sourceName, setSourceName] = useState('');
  const [lineName, setLineName] = useState('');
  const [filterChoices, setFilterChoices] = useState<Record<string, Array<{ value: string; label: string }>>>({});
  const selectable = objects.filter(({ isSelectable }) => isSelectable);
  const objectOptions = selectable.map(({ nameSingular, labelSingular }) => ({ value: nameSingular, label: labelSingular }));
  const byPlural = (namePlural: string) => objects.find((object) => object.namePlural === namePlural);
  const source = objects.find(({ nameSingular }) => nameSingular === sourceName);
  const line = objects.find(({ nameSingular }) => nameSingular === lineName);
  const suggestion = source && line ? suggestPicker('preview', source, line, definition.records) : null;
  const cardStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing[3],
    padding: theme.spacing[4],
    border: `1px solid ${theme.border.color.medium}`,
    borderRadius: theme.border.radius.md,
    background: theme.background.primary,
  };
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: theme.spacing[3],
    alignItems: 'end',
  };
  const fieldOptions = (object: ObjectMetadata | undefined, type: string, noneLabel: string) => [
    { value: NONE, label: noneLabel },
    ...(object?.fields ?? [])
      .filter((field) => field.isActive && !field.isSystem && field.type === type)
      .map(({ name, label }) => ({ value: name, label })),
  ];
  const updatePicker = (key: string, next: (picker: FormPicker) => FormPicker) =>
    onChange({ pickers: definition.pickers.map((picker) => (picker.key === key ? next(picker) : picker)) });

  const addPicker = () => {
    if (!source || !line) {
      return;
    }

    let index = 1;

    while (definition.pickers.some(({ key }) => key === `picker${index}`)) {
      index += 1;
    }

    const picker = suggestPicker(`picker${index}`, source, line, definition.records);

    if (picker) {
      onChange({ pickers: [...definition.pickers, picker] });
      setSourceName('');
      setLineName('');
    }
  };

  const loadFilterChoices = (pickerKey: string, targetNameSingular: string | null, reload = false) => {
    const target = objects.find(({ nameSingular }) => nameSingular === targetNameSingular);

    if (target && (reload || !filterChoices[pickerKey])) {
      void loadRecords(target.namePlural)
        .then((records) =>
          setFilterChoices((current) => ({
            ...current,
            [pickerKey]: records.map((record) => ({ value: record.id, label: recordLabel(record) })),
          })),
        )
        .catch(() => undefined);
    }
  };

  const currencyFields = definition.records.flatMap((record) =>
    (objects.find(({ nameSingular }) => nameSingular === record.objectNameSingular)?.fields ?? [])
      .filter((field) => field.isActive && !field.isSystem && field.type === 'CURRENCY')
      .map((field) => ({ recordKey: record.key, fieldName: field.name, label: `${record.label} → ${field.label}` })),
  );
  const isAsked = (recordKey: string, fieldName: string) =>
    definition.records.some((record) => record.key === recordKey && record.fields.some((field) => field.name === fieldName && !field.hidden));
  const payment = definition.payment;
  const people = definition.records.filter(({ objectNameSingular }) => objectNameSingular === 'person');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4], maxWidth: 880 }}>
      <Text color="secondary">
        {t('Let visitors choose existing records with a quantity, such as tickets or products. Every choice becomes a record of its own, priced from Twenty.')}
      </Text>
      {definition.pickers.map((picker) => {
        const sourceObject = byPlural(picker.source.objectNamePlural);
        const lineObject = byPlural(picker.line.objectNamePlural);
        const relationFilterFields = (sourceObject?.fields ?? []).filter(
          (field) => field.isActive && field.type === 'RELATION' && field.relationType === 'MANY_TO_ONE' && field.joinColumnName,
        );
        const relationFilter = picker.source.filters.find(({ fieldName }) =>
          relationFilterFields.some((field) => field.joinColumnName === fieldName),
        );
        const relationFilterField = relationFilterFields.find((field) => field.joinColumnName === relationFilter?.fieldName);

        return (
          <div key={picker.key} style={cardStyle}>
            <Text>
              {t('Choose from {source}; each choice becomes a {line}.', {
                source: sourceObject?.labelPlural ?? picker.source.objectNamePlural,
                line: lineObject?.labelSingular ?? picker.line.objectNamePlural,
              })}
            </Text>
            <div style={gridStyle}>
              <Field.Root style={{ minWidth: 0 }}>
                <Field.Label>{t('Heading')}</Field.Label>
                <Input value={picker.label} onChange={(event) => updatePicker(picker.key, (current) => ({ ...current, label: event.target.value }))} />
              </Field.Root>
              <Field.Root style={{ minWidth: 0 }}>
                <Field.Label>{t('Most of one choice')}</Field.Label>
                <Input
                  type="number"
                  value={String(picker.maxQuantity)}
                  onChange={(event) =>
                    updatePicker(picker.key, (current) => ({
                      ...current,
                      maxQuantity: Math.min(Math.max(Number.parseInt(event.target.value, 10) || 1, 1), 100),
                    }))
                  }
                />
              </Field.Root>
              <OptionSelect
                label={t('Price')}
                value={picker.source.priceFieldName ?? NONE}
                options={fieldOptions(sourceObject, 'CURRENCY', t('Free'))}
                onChange={(value) =>
                  updatePicker(picker.key, (current) => ({
                    ...current,
                    source: { ...current.source, priceFieldName: value === NONE ? null : value },
                  }))
                }
              />
              <OptionSelect
                label={t('Quantity')}
                value={picker.line.quantityFieldName ?? NONE}
                options={fieldOptions(lineObject, 'NUMBER', t('One record per unit'))}
                onChange={(value) =>
                  updatePicker(picker.key, (current) => ({
                    ...current,
                    line: { ...current.line, quantityFieldName: value === NONE ? null : value },
                  }))
                }
              />
              <OptionSelect
                label={t('Price per unit on the record')}
                value={picker.line.unitPriceFieldName ?? NONE}
                options={fieldOptions(lineObject, 'CURRENCY', t('Not stored'))}
                onChange={(value) =>
                  updatePicker(picker.key, (current) => ({
                    ...current,
                    line: { ...current.line, unitPriceFieldName: value === NONE ? null : value },
                  }))
                }
              />
              <OptionSelect
                label={t('Line total on the record')}
                value={picker.line.lineTotalFieldName ?? NONE}
                options={fieldOptions(lineObject, 'CURRENCY', t('Not stored'))}
                onChange={(value) =>
                  updatePicker(picker.key, (current) => ({
                    ...current,
                    line: { ...current.line, lineTotalFieldName: value === NONE ? null : value },
                  }))
                }
              />
            </div>
            {relationFilterFields.length > 0 && (
              <div style={gridStyle}>
                <OptionSelect
                  label={t('Only choices of')}
                  value={relationFilterField?.name ?? NONE}
                  options={[{ value: NONE, label: t('Any') }, ...relationFilterFields.map(({ name, label }) => ({ value: name, label }))]}
                  onChange={(value) => {
                    const chosen = relationFilterFields.find(({ name }) => name === value);
                    const others = picker.source.filters.filter(({ fieldName }) => fieldName !== relationFilter?.fieldName);

                    updatePicker(picker.key, (current) => ({
                      ...current,
                      source: {
                        ...current.source,
                        filters: chosen ? [...others, { fieldName: chosen.joinColumnName as string, value: '' }] : others,
                      },
                    }));

                    if (chosen) {
                      loadFilterChoices(picker.key, chosen.relationTargetObjectNameSingular, true);
                    }
                  }}
                />
                {relationFilterField && (
                  <OptionSelect
                    label={relationFilterField.label}
                    value={typeof relationFilter?.value === 'string' ? relationFilter.value : ''}
                    placeholder={t('Choose a record')}
                    options={filterChoices[picker.key] ?? []}
                    onChange={(value) =>
                      updatePicker(picker.key, (current) => ({
                        ...current,
                        source: {
                          ...current.source,
                          filters: current.source.filters.map((filter) =>
                            filter.fieldName === relationFilter?.fieldName ? { ...filter, value } : filter,
                          ),
                        },
                      }))
                    }
                  />
                )}
                {relationFilterField && !filterChoices[picker.key] && (
                  <LightButton onClick={() => loadFilterChoices(picker.key, relationFilterField.relationTargetObjectNameSingular)}>
                    {t('Load records')}
                  </LightButton>
                )}
              </div>
            )}
            {(picker.line.links.length > 0 || picker.line.copies.length > 0) && (
              <Text color="light">
                {[
                  ...picker.line.links.map(({ joinColumnName, recordKey }) =>
                    t('{column} points at {record}', {
                      column: joinColumnName,
                      record: definition.records.find(({ key }) => key === recordKey)?.label ?? recordKey,
                    }),
                  ),
                  ...picker.line.copies.map(({ lineJoinColumnName }) => t('{column} is copied from the choice', { column: lineJoinColumnName })),
                ].join(' · ')}
              </Text>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing[3] }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing[4] }}>
                <LabelledCheckbox
                  label={t('Required')}
                  checked={picker.required}
                  onChange={(required) => updatePicker(picker.key, (current) => ({ ...current, required }))}
                />
                <LabelledCheckbox
                  label={t('One choice only')}
                  checked={picker.single}
                  onChange={(single) => updatePicker(picker.key, (current) => ({ ...current, single }))}
                />
              </div>
              <LightButton onClick={() => onChange({ pickers: definition.pickers.filter(({ key }) => key !== picker.key) })}>
                {t('Remove')}
              </LightButton>
            </div>
          </div>
        );
      })}
      <div style={cardStyle}>
        <div style={gridStyle}>
          <OptionSelect label={t('Choose from')} value={sourceName} placeholder={t('Choose an object')} options={objectOptions} onChange={setSourceName} />
          <OptionSelect label={t('Each choice becomes a')} value={lineName} placeholder={t('Choose an object')} options={objectOptions} onChange={setLineName} />
          <div>
            <Button disabled={suggestion === null} onClick={addPicker}>
              {t('Add choices')}
            </Button>
          </div>
        </div>
        {source && line && suggestion === null && (
          <Callout status="neutral" title={t('{line} has no relation to {source}.', { line: line.labelSingular, source: source.labelSingular })} />
        )}
      </div>
      <div style={cardStyle}>
        <LabelledCheckbox
          label={t('Calculate a total')}
          checked={payment !== null}
          onChange={(checked) => onChange({ payment: checked ? suggestPayment(definition.records, definition.pickers, objects) : null })}
        />
        {payment && (
          <>
            <div style={gridStyle}>
              <OptionSelect
                label={t('Currency')}
                value={payment.currencyCode}
                options={CURRENCY_CODES.map((code) => ({ value: code, label: code }))}
                onChange={(currencyCode) => onChange({ payment: { ...payment, currencyCode } })}
              />
              <OptionSelect
                label={t('Who pays')}
                value={payment.payerRecordKey ?? NONE}
                options={[{ value: NONE, label: t('Nobody') }, ...people.map(({ key, label }) => ({ value: key, label }))]}
                onChange={(value) => onChange({ payment: { ...payment, payerRecordKey: value === NONE ? null : value } })}
              />
            </div>
            <LabelledCheckbox
              label={t('Create a payment with status Open when the total is above zero')}
              checked={payment.createPayment}
              onChange={(createPayment) => onChange({ payment: { ...payment, createPayment } })}
            />
            {currencyFields.length > 0 && <Text color="secondary">{t('Amounts the visitor enters that count towards the total')}</Text>}
            {currencyFields
              .filter(({ recordKey, fieldName }) => isAsked(recordKey, fieldName))
              .map(({ recordKey, fieldName, label }) => (
                <LabelledCheckbox
                  key={`amount-${recordKey}-${fieldName}`}
                  label={label}
                  checked={payment.amountFields.some((ref) => ref.recordKey === recordKey && ref.fieldName === fieldName)}
                  onChange={(checked) =>
                    onChange({
                      payment: {
                        ...payment,
                        amountFields: checked
                          ? [...payment.amountFields, { recordKey, fieldName }]
                          : payment.amountFields.filter((ref) => ref.recordKey !== recordKey || ref.fieldName !== fieldName),
                      },
                    })
                  }
                />
              ))}
            {currencyFields.length > 0 && <Text color="secondary">{t('Fields that receive the total')}</Text>}
            {currencyFields.map(({ recordKey, fieldName, label }) => (
              <LabelledCheckbox
                key={`total-${recordKey}-${fieldName}`}
                label={label}
                checked={payment.totalFields.some((ref) => ref.recordKey === recordKey && ref.fieldName === fieldName)}
                onChange={(checked) =>
                  onChange({
                    payment: {
                      ...payment,
                      totalFields: checked
                        ? [...payment.totalFields, { recordKey, fieldName }]
                        : payment.totalFields.filter((ref) => ref.recordKey !== recordKey || ref.fieldName !== fieldName),
                    },
                  })
                }
              />
            ))}
            {payment.createPayment && (
              <LightButton
                onClick={() =>
                  onChange({ payment: { ...payment, paymentLinks: suggestPayment(definition.records, definition.pickers, objects).paymentLinks } })
                }
              >
                {t('Link the payment to {count} records and choices', { count: String(suggestPayment(definition.records, definition.pickers, objects).paymentLinks.length) })}
              </LightButton>
            )}
          </>
        )}
      </div>
    </div>
  );
};
