import { useState } from 'react';
import { Callout } from 'twenty-ui/components/feedback';
import { LightButton } from 'twenty-ui/components/input';
import { Button, Field, Input } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { MATCH_FIELD_TYPES } from 'src/constants/match-field-types';
import { OptionSelect } from 'src/front-components/components/option-select';
import { type FormRecord } from 'src/types/form-record';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { createFormRecord } from 'src/utils/create-form-record.util';
import { getBlockingFields } from 'src/utils/get-blocking-fields.util';
import { isSelectableField } from 'src/utils/is-selectable-field.util';

type RecordsStepProps = {
  records: FormRecord[];
  objects: ObjectMetadata[];
  onChange: (records: FormRecord[]) => void;
};

const ALWAYS_CREATE = '';

export const RecordsStep = ({ records, objects, onChange }: RecordsStepProps) => {
  const theme = useTheme();
  const [objectToAdd, setObjectToAdd] = useState('');

  const updateRecord = (key: string, changes: Partial<FormRecord>) =>
    onChange(records.map((record) => (record.key === key ? { ...record, ...changes } : record)));

  const addRecord = () => {
    const object = objects.find(({ nameSingular }) => nameSingular === objectToAdd);

    if (object !== undefined) {
      onChange([...records, createFormRecord(object, records.map(({ key }) => key))]);
      setObjectToAdd('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
      <Text color="secondary">
        Choose the records a submission writes. Each one is created, or updates an existing record when a field you
        pick matches.
      </Text>
      {records.length === 0 && (
        <Callout status="neutral" title="No records yet" description="Add the first record below, for example a Person." />
      )}
      {records.map((record) => {
        const object = objects.find(({ nameSingular }) => nameSingular === record.objectNameSingular);
        const matchOptions = (object?.fields ?? [])
          .filter((field) => isSelectableField(field) && (MATCH_FIELD_TYPES as readonly string[]).includes(field.type))
          .map((field) => ({ value: field.name, label: `Update when ${field.label} matches` }));
        const blockingFields = object === undefined ? [] : getBlockingFields(object);

        return (
          <div
            key={record.key}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: theme.spacing[3],
              alignItems: 'end',
              padding: theme.spacing[3],
              border: `1px solid ${theme.border.color.light}`,
              borderRadius: theme.border.radius.md,
            }}
          >
            <Field.Root style={{ minWidth: 0 }}>
              <Field.Label>{object?.labelSingular ?? record.objectNameSingular} – section title</Field.Label>
              <Input value={record.label} onChange={(event) => updateRecord(record.key, { label: event.target.value })} />
            </Field.Root>
            <OptionSelect
              label="On submit"
              value={record.mode === 'UPSERT' ? (record.matchFieldName ?? ALWAYS_CREATE) : ALWAYS_CREATE}
              options={[{ value: ALWAYS_CREATE, label: 'Always create' }, ...matchOptions]}
              placeholder="Always create"
              onChange={(matchFieldName) =>
                updateRecord(
                  record.key,
                  matchFieldName === ALWAYS_CREATE
                    ? { mode: 'CREATE', matchFieldName: undefined }
                    : { mode: 'UPSERT', matchFieldName },
                )
              }
            />
            <div>
              <LightButton onClick={() => onChange(records.filter(({ key }) => key !== record.key))}>
                Remove {record.label}
              </LightButton>
            </div>
            {object === undefined && (
              <div style={{ gridColumn: '1 / -1' }}>
                <Callout status="error" title="This object no longer exists" description="Remove this record from the form." />
              </div>
            )}
            {blockingFields.length > 0 && (
              <div style={{ gridColumn: '1 / -1' }}>
                <Callout
                  status="warning"
                  title="This object has required fields a form cannot fill"
                  description={`${blockingFields.map(({ label }) => label).join(', ')}. Creating this record will fail unless a link in step 2 fills them.`}
                />
              </div>
            )}
          </div>
        );
      })}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing[2], alignItems: 'end' }}>
        <div style={{ flex: '1 1 200px', minWidth: 0, maxWidth: 320 }}>
          <OptionSelect
            label="Add a record"
            value={objectToAdd}
            options={objects.map(({ nameSingular, labelSingular }) => ({ value: nameSingular, label: labelSingular }))}
            placeholder="Choose an object"
            onChange={setObjectToAdd}
          />
        </div>
        <Button onClick={addRecord} disabled={objectToAdd === ''}>
          Add record
        </Button>
      </div>
    </div>
  );
};
