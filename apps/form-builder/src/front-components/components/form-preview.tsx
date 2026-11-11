import { useLocale, useTranslate } from 'twenty-sdk/front-component';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { PreviewField } from 'src/front-components/components/preview-field';
import { type FormDefinition } from 'src/types/form-definition';
import { getPublicFormMessages } from 'src/utils/get-public-form-messages.util';

type FormPreviewProps = {
  definition: FormDefinition;
};

// Shows the form as visitors will see it, updating with every edit. Hidden
// fields are listed below it, since they are written but never shown.
export const FormPreview = ({ definition }: FormPreviewProps) => {
  const theme = useTheme();
  const { t } = useTranslate();
  const { messages } = getPublicFormMessages(useLocale(), undefined);
  const visibleRecords = definition.records
    .map((record) => ({ ...record, fields: record.fields.filter(({ hidden }) => hidden !== true) }))
    .filter(({ fields }) => fields.length > 0);
  const hiddenFields = definition.records.flatMap((record) =>
    record.fields.filter(({ hidden }) => hidden === true).map((field) => ({ record, field })),
  );

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
        {visibleRecords.length === 0 && (
          <div style={{ color: '#999' }}>{t('Add a record and a field to see the form here.')}</div>
        )}
        {visibleRecords.map((record) => (
          <div key={record.key} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visibleRecords.length > 1 && (
              <div style={{ fontWeight: 600, paddingBottom: 6, borderBottom: '1px solid #ebebeb', marginTop: 8 }}>
                {record.label}
              </div>
            )}
            {record.fields.map((field) => (
              <PreviewField key={field.name} field={field} messages={messages} />
            ))}
          </div>
        ))}
        {visibleRecords.length > 0 && (
          <div>
            <span
              style={{
                display: 'inline-block',
                marginTop: 4,
                padding: '8px 16px',
                borderRadius: 4,
                background: '#3e63dd',
                color: '#fff',
                fontWeight: 500,
              }}
            >
              {definition.submitLabel}
            </span>
          </div>
        )}
      </div>
      {hiddenFields.length > 0 && (
        <Text size="xs" color="secondary">
          {t('Hidden, filled in automatically:')}{' '}
          {hiddenFields
            .map(({ record, field }) => {
              const optionLabel = (optionValue: string) =>
                field.options?.find((option) => option.value === optionValue)?.label ?? optionValue;
              const value = Array.isArray(field.defaultValue)
                ? field.defaultValue.map(optionLabel).join(', ')
                : typeof field.defaultValue === 'string'
                  ? optionLabel(field.defaultValue)
                  : field.defaultValue;

              return `${record.label} › ${field.label}${value === undefined ? '' : ` = ${String(value)}`}`;
            })
            .join(' · ')}
        </Text>
      )}
    </aside>
  );
};
