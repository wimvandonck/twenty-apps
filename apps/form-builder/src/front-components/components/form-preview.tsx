import { type CSSProperties } from 'react';
import { useLocale, useTranslate } from 'twenty-sdk/front-component';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { DEFAULT_NOW, DEFAULT_TODAY } from 'src/constants/relative-defaults';
import { PreviewField } from 'src/front-components/components/preview-field';
import { type FormDefinition } from 'src/types/form-definition';
import { type FormField } from 'src/types/form-field';
import { getFormSteps } from 'src/utils/get-form-steps.util';
import { getPublicFormMessages } from 'src/utils/get-public-form-messages.util';
import { isPageBreak } from 'src/utils/is-page-break.util';

type FormPreviewProps = {
  definition: FormDefinition;
};

const BUTTON: CSSProperties = {
  display: 'inline-block',
  padding: '8px 16px',
  borderRadius: 4,
  background: '#3e63dd',
  color: '#fff',
  fontWeight: 500,
};
const SECONDARY_BUTTON: CSSProperties = { ...BUTTON, padding: '7px 15px', border: '1px solid #d6d6d6', background: '#fff', color: '#333' };

// Shows the form as visitors will see it, updating with every edit: every
// step below the previous one. Hidden fields are listed below it, since they
// are written but never shown.
export const FormPreview = ({ definition }: FormPreviewProps) => {
  const theme = useTheme();
  const { t } = useTranslate();
  const { messages } = getPublicFormMessages(useLocale(), undefined);
  const steps = getFormSteps(definition);
  const hasSeveralRecords = new Set(steps.flatMap(({ sections }) => sections.map(({ record }) => record.key))).size > 1;
  const optIns = definition.lists.filter(({ optIn }) => optIn);
  const hiddenFields = definition.records.flatMap((record) =>
    record.fields.filter((field) => field.hidden === true && !isPageBreak(field)).map((field) => ({ record, field })),
  );
  const describeDefault = (field: FormField) => {
    const optionLabel = (optionValue: string) =>
      field.options?.find((option) => option.value === optionValue)?.label ?? optionValue;
    const value = field.defaultValue;

    if (value === undefined || typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'object') {
      return (Array.isArray(value) ? value.map(optionLabel) : Object.values(value)).join(', ');
    }

    return field.type === 'DATE' && value === DEFAULT_TODAY
      ? t('Today')
      : field.type === 'DATE_TIME'
        ? value === DEFAULT_NOW
          ? t('Now')
          : new Date(value).toLocaleString()
        : optionLabel(value);
  };

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2], minWidth: 0 }}>
      <Text size="xs" weight="semibold" color="light">
        {t('Preview')}
      </Text>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: 20,
          border: `1px solid ${theme.border.color.medium}`,
          borderRadius: theme.border.radius.md,
          background: '#fff',
          color: '#333',
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        {definition.title !== '' && <div style={{ fontSize: 20, fontWeight: 600 }}>{definition.title}</div>}
        {definition.description !== '' && <div style={{ color: '#666' }}>{definition.description}</div>}
        {steps.length === 0 && (
          <div style={{ color: '#999' }}>{t('Add a record and a field to see the form here.')}</div>
        )}
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                ...(index > 0 ? { paddingTop: 12, borderTop: '2px dashed #d6d6d6' } : {}),
              }}
            >
              {steps.length > 1 && (
                <div style={{ fontSize: 12, color: '#888' }}>
                  {messages.step.replace('{current}', String(index + 1)).replace('{total}', String(steps.length))}
                </div>
              )}
              {step.title !== '' && <div style={{ fontSize: 16, fontWeight: 600 }}>{step.title}</div>}
              {step.sections.map(({ record, fields }) => (
                <div key={record.key} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {hasSeveralRecords && (
                    <div style={{ fontWeight: 600, paddingBottom: 6, borderBottom: '1px solid #ebebeb', marginTop: 8 }}>
                      {record.label}
                    </div>
                  )}
                  {fields.map((field) => (
                    <PreviewField key={field.name} field={field} messages={messages} />
                  ))}
                </div>
              ))}
              {isLast &&
                optIns.map((list) => (
                  <PreviewField
                    key={list.key}
                    field={{ name: list.key, label: list.label, type: 'BOOLEAN', required: false, defaultValue: list.checked || undefined }}
                    messages={messages}
                  />
                ))}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {index > 0 && <span style={SECONDARY_BUTTON}>{messages.back}</span>}
                <span style={BUTTON}>{isLast ? definition.submitLabel : messages.next}</span>
              </div>
            </div>
          );
        })}
      </div>
      {hiddenFields.length > 0 && (
        <Text size="xs" color="secondary">
          {t('Hidden, filled in automatically:')}{' '}
          {hiddenFields
            .map(({ record, field }) => {
              const value = describeDefault(field);

              return `${record.label} › ${field.label}${value === undefined ? '' : ` = ${String(value)}`}`;
            })
            .join(' · ')}
        </Text>
      )}
    </aside>
  );
};
