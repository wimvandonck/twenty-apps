import { useTranslate } from 'twenty-sdk/front-component';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconX } from 'twenty-ui/icon';
import { Field, Input } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { ConditionList } from 'src/front-components/components/condition-list';
import { OptionSelect } from 'src/front-components/components/option-select';
import { type EditorMetadata } from 'src/types/editor-metadata';
import {
  type Aggregate,
  type Condition,
  type ListCondition,
  type Operator,
  type PropertyCondition,
  type PropertyOperator,
  type RelatedCondition,
} from 'src/types/segment-definition';
import { buildPropertyFilter, needsValue, operatorsFor, PROPERTY_FIELD_TYPES } from 'src/utils/build-property-filter.util';
import { measurableFields, personLinks } from 'src/utils/person-links.util';

type ConditionCardProps = {
  condition: Condition;
  metadata: EditorMetadata;
  onChange: (condition: Condition) => void;
  onRemove: () => void;
};

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 } as const;

const RelatedFields = ({
  condition,
  metadata,
  onChange,
}: {
  condition: RelatedCondition;
  metadata: EditorMetadata;
  onChange: (condition: Condition) => void;
}) => {
  const { t } = useTranslate();
  const links = personLinks(metadata.objects);
  const linkKey = `${condition.object}:${condition.relation}`;
  const object = metadata.objects.find((candidate) => candidate.namePlural === condition.object);
  const aggregate: Aggregate = condition.measure?.aggregate ?? 'COUNT';
  const fields = object && aggregate !== 'COUNT' ? measurableFields(object, aggregate) : [];
  const field = condition.measure && condition.measure.aggregate !== 'COUNT' ? condition.measure.field : '';
  const isDate = fields.find((candidate) => candidate.path === field)?.isDate === true;
  const views = object ? metadata.views.filter((view) => view.objectId === object.id) : [];

  const operators: Array<{ value: Operator; label: string }> = [
    { value: 'GTE', label: isDate ? t('on or after') : t('at least') },
    { value: 'GT', label: isDate ? t('after') : t('more than') },
    { value: 'LTE', label: isDate ? t('on or before') : t('at most') },
    { value: 'LT', label: isDate ? t('before') : t('less than') },
    { value: 'EQ', label: t('exactly') },
    { value: 'NEQ', label: t('not') },
  ];

  return (
    <div style={grid}>
      <OptionSelect
        label={t('Linked records')}
        value={links.some((link) => `${link.object.namePlural}:${link.relation.name}` === linkKey) ? linkKey : ''}
        placeholder={t('Choose records')}
        options={links.map((link) => ({
          value: `${link.object.namePlural}:${link.relation.name}`,
          label: `${link.object.labelPlural} (${link.relation.label})`,
        }))}
        onChange={(next) => {
          const [nextObject, nextRelation] = next.split(':');
          onChange({ ...condition, object: nextObject, relation: nextRelation, viewId: undefined, measure: undefined, value: 1 });
        }}
      />
      <OptionSelect
        label={t('Which records')}
        value={condition.viewId ?? 'ALL'}
        options={[{ value: 'ALL', label: t('All records') }, ...views.map((view) => ({ value: view.id, label: view.name }))]}
        onChange={(next) => onChange({ ...condition, viewId: next === 'ALL' ? undefined : next })}
      />
      <OptionSelect
        label={t('Measure')}
        value={aggregate}
        options={[
          { value: 'COUNT', label: t('Number of records') },
          { value: 'SUM', label: t('Total of') },
          { value: 'AVG', label: t('Average of') },
          { value: 'MAX', label: t('Highest or latest') },
          { value: 'MIN', label: t('Lowest or earliest') },
        ]}
        onChange={(next) =>
          onChange({
            ...condition,
            measure: next === 'COUNT' ? undefined : { aggregate: next as Exclude<Aggregate, 'COUNT'>, field: '' },
            value: next === 'COUNT' ? 1 : '',
          })
        }
      />
      {aggregate !== 'COUNT' && (
        <OptionSelect
          label={t('Field')}
          value={field}
          placeholder={t('Choose a field')}
          options={fields.map((candidate) => ({ value: candidate.path, label: candidate.label }))}
          onChange={(next) =>
            onChange({ ...condition, measure: { aggregate: aggregate as Exclude<Aggregate, 'COUNT'>, field: next }, value: '' })
          }
        />
      )}
      <OptionSelect
        label={t('Comparison')}
        value={condition.operator ?? 'GTE'}
        options={operators}
        onChange={(next) => onChange({ ...condition, operator: next as Operator })}
      />
      <Field.Root style={{ minWidth: 0 }}>
        <Field.Label>{t('Value')}</Field.Label>
        <Input
          value={String(condition.value ?? '')}
          placeholder={isDate ? t('2026-01-31 or @today-12M') : t('A number')}
          onChange={(event) => {
            const text = event.target.value;
            const number = Number(text);
            onChange({ ...condition, value: isDate || text === '' || Number.isNaN(number) ? text : number });
          }}
        />
      </Field.Root>
      {condition.filter && (
        <Text color="secondary">{t('This condition also has a filter written by hand, which is kept.')}</Text>
      )}
    </div>
  );
};

const PropertyFields = ({
  condition,
  metadata,
  onChange,
}: {
  condition: PropertyCondition;
  metadata: EditorMetadata;
  onChange: (condition: Condition) => void;
}) => {
  const { t } = useTranslate();

  if (condition.field === undefined) {
    return (
      <Text color="secondary">
        {t('A filter written by hand')}: {JSON.stringify(condition.filter)}
      </Text>
    );
  }

  const person = metadata.objects.find((object) => object.nameSingular === 'person');
  const fields = (person?.fields ?? []).filter((field) => PROPERTY_FIELD_TYPES.includes(field.type));
  const field = fields.find((candidate) => candidate.name === condition.field);
  const operator = condition.operator ?? 'IS';
  const labels: Record<PropertyOperator, string> = {
    CONTAINS: t('contains'),
    IS: t('is'),
    IS_NOT: t('is not'),
    IS_EMPTY: t('is empty'),
    IS_NOT_EMPTY: t('is not empty'),
    GTE: field?.type.startsWith('DATE') ? t('on or after') : t('at least'),
    LTE: field?.type.startsWith('DATE') ? t('on or before') : t('at most'),
  };

  const update = (changes: Partial<PropertyCondition>) => {
    const next = { ...condition, ...changes };
    const nextField = fields.find((candidate) => candidate.name === next.field);

    onChange({
      ...next,
      filter: nextField
        ? buildPropertyFilter(nextField.name, nextField.type, next.operator ?? 'IS', next.value ?? '')
        : {},
    });
  };

  const choices =
    field?.type === 'BOOLEAN'
      ? [
          { value: 'true', label: t('Yes') },
          { value: 'false', label: t('No') },
        ]
      : field?.options;

  return (
    <div style={grid}>
      <OptionSelect
        label={t('Field')}
        value={condition.field}
        placeholder={t('Choose a field')}
        options={fields.map((candidate) => ({ value: candidate.name, label: candidate.label }))}
        onChange={(next) => {
          const nextField = fields.find((candidate) => candidate.name === next);
          update({ field: next, operator: nextField ? operatorsFor(nextField.type)[0] : 'IS', value: '' });
        }}
      />
      {field && (
        <OptionSelect
          label={t('Comparison')}
          value={operator}
          options={operatorsFor(field.type).map((value) => ({ value, label: labels[value] }))}
          onChange={(next) => update({ operator: next as PropertyOperator })}
        />
      )}
      {field && needsValue(operator) && choices && (
        <OptionSelect
          label={t('Value')}
          value={condition.value ?? ''}
          placeholder={t('Choose a value')}
          options={choices}
          onChange={(next) => update({ value: next })}
        />
      )}
      {field && needsValue(operator) && !choices && (
        <Field.Root style={{ minWidth: 0 }}>
          <Field.Label>{t('Value')}</Field.Label>
          <Input
            value={condition.value ?? ''}
            placeholder={field.type.startsWith('DATE') ? t('2026-01-31 or @today-12M') : ''}
            onChange={(event) => update({ value: event.target.value })}
          />
        </Field.Root>
      )}
    </div>
  );
};

const ListFields = ({
  condition,
  metadata,
  onChange,
}: {
  condition: ListCondition;
  metadata: EditorMetadata;
  onChange: (condition: Condition) => void;
}) => {
  const { t } = useTranslate();

  return (
    <div style={grid}>
      <OptionSelect
        label={t('Membership')}
        value={condition.isMember === false ? 'NOT' : 'IS'}
        options={[
          { value: 'IS', label: t('is on the list') },
          { value: 'NOT', label: t('is not on the list') },
        ]}
        onChange={(next) => onChange({ ...condition, isMember: next === 'IS' })}
      />
      <OptionSelect
        label={t('List')}
        value={condition.listId}
        placeholder={t('Choose a list')}
        options={metadata.lists.map((list) => ({ value: list.id, label: list.name }))}
        onChange={(next) => onChange({ ...condition, listId: next })}
      />
    </div>
  );
};

export const ConditionCard = ({ condition, metadata, onChange, onRemove }: ConditionCardProps) => {
  const { t } = useTranslate();
  const theme = useTheme();
  const titles = {
    related: t('Linked records'),
    property: t('Own field'),
    list: t('List'),
    group: t('Group'),
  };

  return (
    <div
      style={{
        border: `1px solid ${theme.border.color.medium}`,
        borderRadius: theme.border.radius.md,
        padding: theme.spacing[3],
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[3],
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing[2] }}>
        <Text weight="medium">{titles[condition.type]}</Text>
        <LightIconButton aria-label={`${t('Remove')}: ${titles[condition.type]}`} onClick={onRemove}>
          <IconX size={16} />
        </LightIconButton>
      </div>
      {condition.type === 'related' && <RelatedFields condition={condition} metadata={metadata} onChange={onChange} />}
      {condition.type === 'property' && <PropertyFields condition={condition} metadata={metadata} onChange={onChange} />}
      {condition.type === 'list' && <ListFields condition={condition} metadata={metadata} onChange={onChange} />}
      {condition.type === 'group' && (
        <ConditionList
          match={condition.match}
          conditions={condition.conditions}
          metadata={metadata}
          onChange={(match, conditions) => onChange({ ...condition, match, conditions })}
        />
      )}
    </div>
  );
};
