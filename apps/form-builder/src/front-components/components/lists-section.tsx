import { useTranslate } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { LightButton } from 'twenty-ui/components/input';
import { Button, Field, Input } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { LIST_PERSON_OBJECT_NAME_SINGULAR } from 'src/constants/list-objects';
import { LabelledCheckbox } from 'src/front-components/components/labelled-checkbox';
import { OptionSelect } from 'src/front-components/components/option-select';
import { type FormList } from 'src/types/form-list';
import { type FormRecord } from 'src/types/form-record';
import { type ListSummary } from 'src/types/list-summary';

type ListsSectionProps = {
  lists: FormList[];
  records: FormRecord[];
  // null when the workspace has no lists.
  availableLists: ListSummary[] | null;
  onChange: (lists: FormList[]) => void;
};

const ALWAYS = 'always';
const OPT_IN = 'optIn';

export const ListsSection = ({ lists, records, availableLists, onChange }: ListsSectionProps) => {
  const theme = useTheme();
  const { t } = useTranslate();
  const people = records.filter(({ objectNameSingular }) => objectNameSingular === LIST_PERSON_OBJECT_NAME_SINGULAR);
  const personOptions = people.map(({ key, label }) => ({ value: key, label }));
  const update = (key: string, changes: Partial<FormList>) =>
    onChange(lists.map((list) => (list.key === key ? { ...list, ...changes } : list)));

  const add = () => {
    const [first] = availableLists ?? [];
    let index = 1;

    while (lists.some(({ key }) => key === `list${index}`)) {
      index += 1;
    }

    if (first !== undefined && people.length > 0) {
      onChange([
        ...lists,
        {
          key: `list${index}`,
          listId: first.id,
          listName: first.name,
          recordKey: people[0].key,
          optIn: false,
          label: t('Subscribe to {list}', { list: first.name }),
          checked: false,
        },
      ]);
    }
  };

  if (availableLists === null) {
    return <Callout status="neutral" title={t('Lists are not available in this workspace.')} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3], maxWidth: 880 }}>
      <Text color="secondary">
        {t('Add the person of a submission to a list, always or only when the visitor ticks a box.')}
      </Text>
      {availableLists.length === 0 && <Callout status="neutral" title={t('Create a list in Twenty first.')} />}
      {people.length === 0 && <Callout status="neutral" title={t('Add a person record to the form first.')} />}
      {lists.map((list) => {
        // A list that was deleted in Twenty keeps the name it had.
        const listOptions = availableLists.some(({ id }) => id === list.listId)
          ? availableLists
          : [...availableLists, { id: list.listId, name: list.listName }];

        return (
          <div
            key={list.key}
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: theme.spacing[3],
                alignItems: 'end',
              }}
            >
              <OptionSelect
                label={t('List')}
                value={list.listId}
                options={listOptions.map(({ id, name }) => ({ value: id, label: name }))}
                onChange={(listId) => {
                  const chosen = listOptions.find(({ id }) => id === listId);

                  if (chosen !== undefined) {
                    update(list.key, {
                      listId,
                      listName: chosen.name,
                      // Follow the list, unless the text was rewritten.
                      ...(list.label === t('Subscribe to {list}', { list: list.listName })
                        ? { label: t('Subscribe to {list}', { list: chosen.name }) }
                        : {}),
                    });
                  }
                }}
              />
              <OptionSelect
                label={t('Person')}
                value={list.recordKey}
                options={personOptions}
                onChange={(recordKey) => update(list.key, { recordKey })}
              />
              <OptionSelect
                label={t('Add to the list')}
                value={list.optIn ? OPT_IN : ALWAYS}
                options={[
                  { value: ALWAYS, label: t('Always') },
                  { value: OPT_IN, label: t('When the visitor ticks a box') },
                ]}
                onChange={(mode) => update(list.key, { optIn: mode === OPT_IN })}
              />
            </div>
            {list.optIn && (
              <Field.Root style={{ minWidth: 0 }}>
                <Field.Label>{t('Label of the checkbox')}</Field.Label>
                <Input value={list.label} onChange={(event) => update(list.key, { label: event.target.value })} />
              </Field.Root>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing[3] }}>
              {list.optIn ? (
                <LabelledCheckbox
                  label={t('Ticked by default')}
                  checked={list.checked}
                  onChange={(checked) => update(list.key, { checked })}
                />
              ) : (
                <span />
              )}
              <LightButton onClick={() => onChange(lists.filter(({ key }) => key !== list.key))}>{t('Remove')}</LightButton>
            </div>
          </div>
        );
      })}
      {lists.length === 0 && <Text color="light">{t('No lists yet.')}</Text>}
      <div>
        <Button disabled={availableLists.length === 0 || people.length === 0} onClick={add}>
          {t('Add list')}
        </Button>
      </div>
    </div>
  );
};
