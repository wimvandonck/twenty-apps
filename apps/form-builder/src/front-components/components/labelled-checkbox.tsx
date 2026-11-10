import { useId } from 'react';
import { Checkbox } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

type LabelledCheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  // Keeps the label for screen readers only, for use under a column heading.
  hideLabel?: boolean;
};

export const LabelledCheckbox = ({ label, checked, onChange, disabled, hideLabel }: LabelledCheckboxProps) => {
  const id = useId();

  if (hideLabel === true) {
    return (
      <Checkbox
        aria-label={label}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(next) => onChange(next === true)}
      />
    );
  }

  return (
    <label htmlFor={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      <Checkbox id={id} checked={checked} disabled={disabled} onCheckedChange={(next) => onChange(next === true)} />
      <Text render={<span />} color={disabled ? 'tertiary' : 'primary'}>
        {label}
      </Text>
    </label>
  );
};
