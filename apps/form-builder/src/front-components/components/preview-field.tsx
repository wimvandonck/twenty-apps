import { type CSSProperties } from 'react';

import { DEFAULT_NOW, DEFAULT_TODAY } from 'src/constants/relative-defaults';
import { type FormField } from 'src/types/form-field';
import { type PublicFormMessages } from 'src/types/public-form-messages';

type PreviewFieldProps = {
  field: FormField;
  messages: PublicFormMessages;
};

// The public form has its own fixed, light styling, so the preview does too.
const BOX: CSSProperties = {
  boxSizing: 'border-box',
  minHeight: 34,
  padding: '7px 10px',
  border: '1px solid #d6d6d6',
  borderRadius: 4,
  background: '#fff',
  color: '#333',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};
const LABEL: CSSProperties = { fontSize: 13, fontWeight: 500, marginBottom: 4 };
const PART_LABEL: CSSProperties = { fontSize: 12, color: '#666', marginBottom: 2 };
const ROW: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 };
const CHECK: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8 };

const Tick = ({ checked }: { checked: boolean }) => (
  <span
    aria-hidden="true"
    style={{
      width: 14,
      height: 14,
      flexShrink: 0,
      border: '1px solid #b0b0b0',
      borderRadius: 3,
      background: checked ? '#3e63dd' : '#fff',
    }}
  />
);

const Part = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <div style={PART_LABEL}>{label}</div>
    <div style={BOX}>{value}</div>
  </div>
);

// A static picture of one field as visitors will see it.
export const PreviewField = ({ field, messages }: PreviewFieldProps) => {
  const stored = typeof field.defaultValue === 'string' ? field.defaultValue : '';
  // Dates are shown the way the visitor's browser will write them.
  const text =
    field.type === 'DATE' && stored !== ''
      ? (stored === DEFAULT_TODAY ? new Date() : new Date(`${stored}T00:00`)).toLocaleDateString()
      : field.type === 'DATE_TIME' && stored !== ''
        ? (stored === DEFAULT_NOW ? new Date() : new Date(stored)).toLocaleString(undefined, {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : stored;
  const parts: Record<string, string> =
    typeof field.defaultValue === 'object' && !Array.isArray(field.defaultValue) ? field.defaultValue : {};
  const optionLabel = (value: string) => field.options?.find((option) => option.value === value)?.label ?? value;
  const label = (
    <div style={LABEL}>
      {field.label}
      {field.required && <span style={{ color: '#e5484d' }}> *</span>}
    </div>
  );

  if (field.type === 'BOOLEAN') {
    return (
      <div style={{ ...CHECK, fontSize: 13 }}>
        <Tick checked={field.defaultValue === true} />
        <span>
          {field.label}
          {field.required && <span style={{ color: '#e5484d' }}> *</span>}
        </span>
      </div>
    );
  }

  return (
    <div>
      {label}
      {field.type === 'MULTI_SELECT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {(field.options ?? []).map((option) => (
            <div key={option.value} style={CHECK}>
              <Tick checked={Array.isArray(field.defaultValue) && field.defaultValue.includes(option.value)} />
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
      {field.type === 'FULL_NAME' && (
        <div style={ROW}>
          <Part label={messages.firstName} value={parts.firstName} />
          <Part label={messages.lastName} value={parts.lastName} />
        </div>
      )}
      {field.type === 'CURRENCY' && (
        <div style={ROW}>
          <Part label={messages.amount} value={parts.amount} />
          <Part label={messages.currency} value={parts.currencyCode} />
        </div>
      )}
      {field.type === 'ADDRESS' && (
        <div style={ROW}>
          <Part label={messages.street} value={parts.street} />
          <Part label={messages.postcode} value={parts.postcode} />
          <Part label={messages.city} value={parts.city} />
          <Part label={messages.country} value={parts.country} />
        </div>
      )}
      {field.type === 'SELECT' && (
        <div style={{ ...BOX, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <span>{text === '' ? '' : optionLabel(text)}</span>
          <span aria-hidden="true" style={{ color: '#999' }}>
            ▾
          </span>
        </div>
      )}
      {field.type === 'RICH_TEXT' && <div style={{ ...BOX, minHeight: 80, whiteSpace: 'pre-wrap' }}>{text}</div>}
      {!['MULTI_SELECT', 'FULL_NAME', 'CURRENCY', 'ADDRESS', 'SELECT', 'RICH_TEXT'].includes(field.type) && (
        <div style={BOX}>{text}</div>
      )}
    </div>
  );
};
