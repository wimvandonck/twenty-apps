import { Field, Select } from 'twenty-ui/primitives/input';

type OptionSelectProps = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export const OptionSelect = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
}: OptionSelectProps) => (
  <Field.Root style={{ minWidth: 0 }}>
    <Field.Label>{label}</Field.Label>
    <Select.Root
      items={options}
      value={value === '' ? null : value}
      disabled={disabled}
      onValueChange={(next) => onChange(typeof next === 'string' ? next : '')}
    >
      <Select.Trigger aria-label={label}>
        <Select.Value placeholder={placeholder ?? 'Choose…'} />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner align="start" sideOffset={8} alignItemWithTrigger={false}>
          <Select.Popup style={{ maxHeight: 240, overflowY: 'auto' }}>
            {options.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  </Field.Root>
);
