import { useTranslate } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconArrowDown, IconArrowUp, IconTrash } from 'twenty-ui/icon';
import { Button, Field, Input } from 'twenty-ui/primitives/input';
import { Heading, Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { MATCH_FIELD_TYPES } from 'src/constants/match-field-types';
import { FieldRow } from 'src/front-components/components/field-row';
import { OptionSelect } from 'src/front-components/components/option-select';
import { type FormField } from 'src/types/form-field';
import { type FormRecord } from 'src/types/form-record';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { getBlockingFields } from 'src/utils/get-blocking-fields.util';
import { isPageBreak } from 'src/utils/is-page-break.util';
import { isRequiredField } from 'src/utils/is-required-field.util';
import { isSelectableField } from 'src/utils/is-selectable-field.util';
import { moveItem } from 'src/utils/move-item.util';
import { toFormField } from 'src/utils/to-form-field.util';

type RecordCardProps = {
  record: FormRecord;
  object: ObjectMetadata | undefined;
  isFirst: boolean;
  isLast: boolean;
  onChange: (record: FormRecord) => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
};

// A real value, so the select shows it as a choice and not as a placeholder.
const ALWAYS_CREATE = '__always_create__';
const FIELD_GRID = 'minmax(120px, 1.1fr) minmax(110px, 1fr) minmax(110px, 1fr) auto auto auto';

export const RecordCard = ({ record, object, isFirst, isLast, onChange, onMove, onRemove }: RecordCardProps) => {
  const theme = useTheme();
  const { t } = useTranslate();
  const selectable = (object?.fields ?? []).filter(isSelectableField);
  const available = selectable.filter(({ name }) => !record.fields.some((field) => field.name === name));
  const matchOptions = selectable
    .filter((field) => (MATCH_FIELD_TYPES as readonly string[]).includes(field.type))
    .map((field) => ({ value: field.name, label: t('Update when {field} matches', { field: field.label }) }));
  const blockingFields = object === undefined ? [] : getBlockingFields(object);
  const objectLabel = object?.labelSingular ?? record.objectNameSingular;

  const setFields = (fields: FormField[]) => onChange({ ...record, fields });
  const addPageBreak = () => {
    const taken = [...record.fields, ...(object?.fields ?? [])].map(({ name }) => name);
    let index = 1;

    while (taken.includes(`pageBreak${index}`)) {
      index += 1;
    }

    setFields([...record.fields, { name: `pageBreak${index}`, label: '', type: 'PAGE_BREAK', required: false }]);
  };

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[3],
        padding: theme.spacing[4],
        border: `1px solid ${theme.border.color.medium}`,
        borderRadius: theme.border.radius.md,
        background: theme.background.primary,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing[2] }}>
        <Heading level={3}>{objectLabel}</Heading>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LightIconButton aria-label={`${t('Move up')}: ${record.label}`} disabled={isFirst} onClick={() => onMove(-1)}>
            <IconArrowUp />
          </LightIconButton>
          <LightIconButton aria-label={`${t('Move down')}: ${record.label}`} disabled={isLast} onClick={() => onMove(1)}>
            <IconArrowDown />
          </LightIconButton>
          <LightIconButton aria-label={`${t('Remove record')}: ${record.label}`} onClick={onRemove}>
            <IconTrash />
          </LightIconButton>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing[3] }}>
        <Field.Root style={{ minWidth: 0 }}>
          <Field.Label>{t('Section title')}</Field.Label>
          <Input value={record.label} onChange={(event) => onChange({ ...record, label: event.target.value })} />
        </Field.Root>
        <OptionSelect
          label={t('On submit')}
          value={record.mode === 'UPSERT' ? (record.matchFieldName ?? ALWAYS_CREATE) : ALWAYS_CREATE}
          options={[{ value: ALWAYS_CREATE, label: t('Always create') }, ...matchOptions]}
          placeholder={t('Always create')}
          onChange={(matchFieldName) =>
            onChange(
              matchFieldName === ALWAYS_CREATE
                ? { ...record, mode: 'CREATE', matchFieldName: undefined }
                : { ...record, mode: 'UPSERT', matchFieldName },
            )
          }
        />
      </div>
      {object === undefined && <Callout status="error" title={t('This object no longer exists')} />}
      {blockingFields.length > 0 && (
        <Callout
          status="warning"
          title={t('This object has required fields a form cannot fill')}
          description={t('{fields}. Creating this record fails unless a link fills them.', {
            fields: blockingFields.map(({ label }) => label).join(', '),
          })}
        />
      )}
      {record.fields.length === 0 ? (
        <Text color="secondary">{t('No fields yet. Add the first one below.')}</Text>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: FIELD_GRID, gap: theme.spacing[2], alignItems: 'start', minWidth: 620 }}>
            {[t('Field'), t('Label on the form'), t('Default value'), t('Required'), t('Hidden'), ''].map((heading, index) => (
              <Text key={index} size="xs" weight="semibold" color="light">
                {heading}
              </Text>
            ))}
            {record.fields.map((field, index) => {
              const metadata = selectable.find(({ name }) => name === field.name);

              return (
                <FieldRow
                  key={field.name}
                  field={field}
                  sourceLabel={isPageBreak(field) ? t('Page break') : (metadata?.label ?? field.name)}
                  isRequiredByTwenty={metadata !== undefined && isRequiredField(metadata)}
                  isMatchField={record.mode === 'UPSERT' && record.matchFieldName === field.name}
                  isFirst={index === 0}
                  isLast={index === record.fields.length - 1}
                  onChange={(changes) =>
                    setFields(record.fields.map((current) => (current.name === field.name ? { ...current, ...changes } : current)))
                  }
                  onMove={(offset) => setFields(moveItem(record.fields, index, offset))}
                  onRemove={() => setFields(record.fields.filter(({ name }) => name !== field.name))}
                />
              );
            })}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: theme.spacing[3] }}>
        {available.length > 0 && (
          <div style={{ flex: '0 1 320px', minWidth: 0 }}>
            <OptionSelect
              label={t('Add a field')}
              value=""
              options={available.map(({ name, label }) => ({ value: name, label }))}
              placeholder={t('Choose a field')}
              onChange={(name) => {
                const metadata = available.find((candidate) => candidate.name === name);

                if (metadata !== undefined) {
                  setFields([...record.fields, toFormField(metadata)]);
                }
              }}
            />
          </div>
        )}
        <Button onClick={addPageBreak}>{t('Add page break')}</Button>
      </div>
    </section>
  );
};
