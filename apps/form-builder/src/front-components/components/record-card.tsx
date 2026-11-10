import { useTranslate } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { LightButton } from 'twenty-ui/components/input';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Field, Input } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { DEFAULT_VALUE_FIELD_TYPES } from 'src/constants/default-value-field-types';
import { MATCH_FIELD_TYPES } from 'src/constants/match-field-types';
import { DefaultValueInput } from 'src/front-components/components/default-value-input';
import { LabelledCheckbox } from 'src/front-components/components/labelled-checkbox';
import { OptionSelect } from 'src/front-components/components/option-select';
import { type FormField } from 'src/types/form-field';
import { type FormRecord } from 'src/types/form-record';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { getBlockingFields } from 'src/utils/get-blocking-fields.util';
import { isRequiredField } from 'src/utils/is-required-field.util';
import { isSelectableField } from 'src/utils/is-selectable-field.util';
import { toFormField } from 'src/utils/to-form-field.util';

type RecordCardProps = {
  record: FormRecord;
  object: ObjectMetadata | undefined;
  onChange: (record: FormRecord) => void;
  onRemove: () => void;
};

const ALWAYS_CREATE = '';
const FIELD_GRID = 'minmax(140px, 1.3fr) minmax(110px, 1fr) minmax(110px, 1fr) auto auto';

export const RecordCard = ({ record, object, onChange, onRemove }: RecordCardProps) => {
  const theme = useTheme();
  const { t } = useTranslate();
  const selectable = (object?.fields ?? []).filter(isSelectableField);
  const matchOptions = selectable
    .filter((field) => (MATCH_FIELD_TYPES as readonly string[]).includes(field.type))
    .map((field) => ({ value: field.name, label: t('Update when {field} matches', { field: field.label }) }));
  const blockingFields = object === undefined ? [] : getBlockingFields(object);

  const updateField = (name: string, changes: Partial<FormField>) =>
    onChange({
      ...record,
      fields: record.fields.map((field) => {
        if (field.name !== name) {
          return field;
        }

        const next = { ...field, ...changes };

        // A required field can only stay hidden while a default fills it.
        return next.required && next.defaultValue === undefined ? { ...next, hidden: false } : next;
      }),
    });

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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing[3], alignItems: 'end' }}>
        <div style={{ flex: '1 1 180px', minWidth: 0 }}>
          <Field.Root>
            <Field.Label>
              {t('{object} – section title', { object: object?.labelSingular ?? record.objectNameSingular })}
            </Field.Label>
            <Input value={record.label} onChange={(event) => onChange({ ...record, label: event.target.value })} />
          </Field.Root>
        </div>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
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
        <LightButton onClick={onRemove}>{t('Remove record')}</LightButton>
      </div>
      {object === undefined && (
        <Callout status="error" title={t('This object no longer exists')} />
      )}
      {blockingFields.length > 0 && (
        <Callout
          status="warning"
          title={t('This object has required fields a form cannot fill')}
          description={t('{fields}. Creating this record fails unless a link fills them.', {
            fields: blockingFields.map(({ label }) => label).join(', '),
          })}
        />
      )}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: FIELD_GRID, gap: theme.spacing[2], alignItems: 'center', minWidth: 560 }}>
          {[t('Field'), t('Label on the form'), t('Default value'), t('Required'), t('Hidden')].map((heading) => (
            <Text key={heading} size="xs" weight="semibold" color="light">
              {heading}
            </Text>
          ))}
          {selectable.map((metadata) => {
            const field = record.fields.find(({ name }) => name === metadata.name);
            const isMatchField = record.mode === 'UPSERT' && record.matchFieldName === metadata.name;
            const isLocked = isRequiredField(metadata) || isMatchField;
            const canHaveDefault = DEFAULT_VALUE_FIELD_TYPES.includes(toFormField(metadata).type);

            return (
              <div key={metadata.name} style={{ display: 'contents' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing[2], minWidth: 0, minHeight: 32 }}>
                  <LabelledCheckbox
                    label={metadata.label}
                    checked={field !== undefined}
                    disabled={isLocked}
                    onChange={(checked) =>
                      onChange({
                        ...record,
                        fields: checked
                          ? [...record.fields, toFormField(metadata)]
                          : record.fields.filter(({ name }) => name !== metadata.name),
                      })
                    }
                  />
                  {isRequiredField(metadata) && <Tag color="red">{t('Required by Twenty')}</Tag>}
                  {isMatchField && <Tag color="blue">{t('Used to match')}</Tag>}
                </div>
                {field === undefined ? (
                  <>
                    <span />
                    <span />
                    <span />
                    <span />
                  </>
                ) : (
                  <>
                    <Input
                      aria-label={`${t('Label on the form')}: ${metadata.label}`}
                      value={field.label}
                      onChange={(event) => updateField(field.name, { label: event.target.value })}
                    />
                    {canHaveDefault ? (
                      <DefaultValueInput field={field} onChange={(defaultValue) => updateField(field.name, { defaultValue })} />
                    ) : (
                      <Text size="xs" color="light">
                        {t('Not available')}
                      </Text>
                    )}
                    <LabelledCheckbox
                      label={t('Required')}
                      hideLabel
                      checked={field.required}
                      disabled={isLocked}
                      onChange={(required) => updateField(field.name, { required })}
                    />
                    <LabelledCheckbox
                      label={t('Hidden')}
                      hideLabel
                      checked={field.hidden === true}
                      disabled={field.required && field.defaultValue === undefined}
                      onChange={(hidden) => updateField(field.name, { hidden })}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Text size="xs" color="light">
        {t('A hidden field is not shown to visitors and always gets its default value.')}
      </Text>
    </section>
  );
};
