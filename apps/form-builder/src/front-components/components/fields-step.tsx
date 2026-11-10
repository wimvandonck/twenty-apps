import { Callout } from 'twenty-ui/components/feedback';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Input } from 'twenty-ui/primitives/input';
import { Heading, Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { LabelledCheckbox } from 'src/front-components/components/labelled-checkbox';
import { type FormField } from 'src/types/form-field';
import { type FormRecord } from 'src/types/form-record';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { isRequiredField } from 'src/utils/is-required-field.util';
import { isSelectableField } from 'src/utils/is-selectable-field.util';
import { toFormField } from 'src/utils/to-form-field.util';

type FieldsStepProps = {
  records: FormRecord[];
  objects: ObjectMetadata[];
  onChange: (records: FormRecord[]) => void;
};

export const FieldsStep = ({ records, objects, onChange }: FieldsStepProps) => {
  const theme = useTheme();

  const setFields = (key: string, fields: FormField[]) =>
    onChange(records.map((record) => (record.key === key ? { ...record, fields } : record)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[5] }}>
      <Text color="secondary">
        Tick the fields to ask for. Fields Twenty requires are always included; system fields are never offered.
      </Text>
      {records.length === 0 && <Callout status="neutral" title="No records yet" description="Add a record in step 1 first." />}
      {records.map((record) => {
        const object = objects.find(({ nameSingular }) => nameSingular === record.objectNameSingular);
        const selectable = (object?.fields ?? []).filter(isSelectableField);

        return (
          <section key={record.key} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
            <Heading level={3}>{record.label}</Heading>
            {selectable.map((metadata) => {
              const selected = record.fields.find(({ name }) => name === metadata.name);
              const isMatchField = record.mode === 'UPSERT' && record.matchFieldName === metadata.name;
              const isLocked = isRequiredField(metadata) || isMatchField;
              const update = (changes: Partial<FormField>) =>
                setFields(
                  record.key,
                  record.fields.map((field) => (field.name === metadata.name ? { ...field, ...changes } : field)),
                );

              return (
                <div
                  key={metadata.name}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) auto',
                    gap: theme.spacing[3],
                    alignItems: 'center',
                    minHeight: 32,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2], minWidth: 0 }}>
                    <LabelledCheckbox
                      label={metadata.label}
                      checked={selected !== undefined}
                      disabled={isLocked}
                      onChange={(checked) =>
                        setFields(
                          record.key,
                          checked
                            ? [...record.fields, toFormField(metadata)]
                            : record.fields.filter(({ name }) => name !== metadata.name),
                        )
                      }
                    />
                    {isRequiredField(metadata) && <Tag color="red">Required by Twenty</Tag>}
                    {isMatchField && <Tag color="blue">Used to match</Tag>}
                  </div>
                  {selected !== undefined ? (
                    <>
                      <Input
                        aria-label={`Label shown for ${metadata.label}`}
                        value={selected.label}
                        onChange={(event) => update({ label: event.target.value })}
                      />
                      <LabelledCheckbox
                        label="Required"
                        checked={selected.required}
                        disabled={isLocked}
                        onChange={(required) => update({ required })}
                      />
                    </>
                  ) : (
                    <>
                      <span />
                      <span />
                    </>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
};
