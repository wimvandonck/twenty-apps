import { useTranslate } from 'twenty-sdk/front-component';
import { Input } from 'twenty-ui/primitives/input';

import { LabelledCheckbox } from 'src/front-components/components/labelled-checkbox';
import { OptionSelect } from 'src/front-components/components/option-select';
import { type FormField } from 'src/types/form-field';

type DefaultValueInputProps = {
  field: FormField;
  onChange: (defaultValue: FormField['defaultValue']) => void;
};

const NO_DEFAULT = '';

export const DefaultValueInput = ({ field, onChange }: DefaultValueInputProps) => {
  const { t } = useTranslate();
  const label = `${t('Default value')}: ${field.label}`;
  const options = field.options ?? [];

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
        value={typeof field.defaultValue === 'string' ? field.defaultValue : NO_DEFAULT}
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

  return (
    <Input
      aria-label={label}
      type={field.type === 'DATE' ? 'date' : field.type === 'NUMBER' ? 'number' : 'text'}
      placeholder={t('No default')}
      value={typeof field.defaultValue === 'string' ? field.defaultValue : ''}
      onChange={(event) => onChange(event.target.value === '' ? undefined : event.target.value)}
    />
  );
};
