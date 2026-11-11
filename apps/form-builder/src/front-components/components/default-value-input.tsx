import { useLocale, useTranslate } from 'twenty-sdk/front-component';
import { Input } from 'twenty-ui/primitives/input';

import { CURRENCY_CODES } from 'src/constants/currency-codes';
import { FIELD_PARTS } from 'src/constants/field-parts';
import { DEFAULT_NOW, DEFAULT_TODAY } from 'src/constants/relative-defaults';
import { LabelledCheckbox } from 'src/front-components/components/labelled-checkbox';
import { OptionSelect } from 'src/front-components/components/option-select';
import { type FormField } from 'src/types/form-field';
import { type PublicFormMessages } from 'src/types/public-form-messages';
import { getPublicFormMessages } from 'src/utils/get-public-form-messages.util';
import { toLocalDateTime } from 'src/utils/to-local-date-time.util';

type DefaultValueInputProps = {
  field: FormField;
  onChange: (defaultValue: FormField['defaultValue']) => void;
};

const NO_DEFAULT = '';
const STACK = { display: 'flex', flexDirection: 'column' as const, gap: 4, minWidth: 0 };
// The words visitors see next to each part of a composite field.
const PART_LABELS: Record<string, keyof PublicFormMessages> = {
  firstName: 'firstName',
  lastName: 'lastName',
  amount: 'amount',
  currencyCode: 'currency',
  street: 'street',
  postcode: 'postcode',
  city: 'city',
  country: 'country',
};

export const DefaultValueInput = ({ field, onChange }: DefaultValueInputProps) => {
  const { t } = useTranslate();
  const { messages } = getPublicFormMessages(useLocale(), undefined);
  const label = `${t('Default value')}: ${field.label}`;
  const options = field.options ?? [];
  const text = typeof field.defaultValue === 'string' ? field.defaultValue : '';
  const partNames = FIELD_PARTS[field.type];

  if (field.type === 'BOOLEAN') {
    return (
      <LabelledCheckbox
        label={t('Ticked')}
        checked={field.defaultValue === true}
        onChange={(checked) => onChange(checked ? true : undefined)}
      />
    );
  }

  if (field.type === 'SELECT') {
    return (
      <OptionSelect
        label={label}
        hideLabel
        value={text}
        options={[{ value: NO_DEFAULT, label: t('No default') }, ...options]}
        placeholder={t('No default')}
        onChange={(value) => onChange(value === NO_DEFAULT ? undefined : value)}
      />
    );
  }

  if (field.type === 'MULTI_SELECT') {
    const selected = Array.isArray(field.defaultValue) ? field.defaultValue : [];

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((option) => (
          <LabelledCheckbox
            key={option.value}
            label={option.label}
            checked={selected.includes(option.value)}
            onChange={(checked) => {
              const next = checked
                ? [...selected, option.value]
                : selected.filter((value) => value !== option.value);

              onChange(next.length > 0 ? next : undefined);
            }}
          />
        ))}
      </div>
    );
  }

  if (partNames !== undefined) {
    const parts: Record<string, string> =
      typeof field.defaultValue === 'object' && !Array.isArray(field.defaultValue) ? field.defaultValue : {};
    const setPart = (name: string, value: string) => {
      const next = Object.fromEntries(
        Object.entries({ ...parts, [name]: value }).filter(([, partValue]) => partValue !== ''),
      );

      onChange(Object.keys(next).length > 0 ? next : undefined);
    };

    return (
      <div style={STACK}>
        {partNames.map((name) => {
          const partLabel = messages[PART_LABELS[name]];

          return name === 'currencyCode' ? (
            <OptionSelect
              key={name}
              label={`${label}: ${partLabel}`}
              hideLabel
              value={parts[name] ?? NO_DEFAULT}
              options={CURRENCY_CODES.map((code) => ({ value: code, label: code }))}
              placeholder={partLabel}
              onChange={(value) => setPart(name, value)}
            />
          ) : (
            <Input
              key={name}
              aria-label={`${label}: ${partLabel}`}
              type={name === 'amount' ? 'number' : 'text'}
              placeholder={partLabel}
              value={parts[name] ?? ''}
              onChange={(event) => setPart(name, event.target.value)}
            />
          );
        })}
      </div>
    );
  }

  if (field.type === 'DATE' || field.type === 'DATE_TIME') {
    const isDate = field.type === 'DATE';
    const relative = isDate ? DEFAULT_TODAY : DEFAULT_NOW;
    const isRelative = text === relative;

    return (
      <div style={STACK}>
        <Input
          aria-label={label}
          type={isDate ? 'date' : 'datetime-local'}
          disabled={isRelative}
          value={isRelative ? '' : isDate ? text : toLocalDateTime(text)}
          onChange={(event) => {
            const value = event.target.value;
            // A date and time is stored in UTC and shown to each visitor in
            // their own time zone.
            const time = new Date(value).getTime();

            onChange(value === '' || Number.isNaN(time) ? undefined : isDate ? value : new Date(time).toISOString());
          }}
        />
        <LabelledCheckbox
          label={isDate ? t('Today') : t('Now')}
          checked={isRelative}
          onChange={(checked) => onChange(checked ? relative : undefined)}
        />
      </div>
    );
  }

  return (
    <Input
      aria-label={label}
      type={field.type === 'NUMBER' ? 'number' : 'text'}
      placeholder={t('No default')}
      value={text}
      onChange={(event) => onChange(event.target.value === '' ? undefined : event.target.value)}
    />
  );
};
