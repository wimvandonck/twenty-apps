import { useId } from 'react';
import { Checkbox } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

type LabelledCheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export const LabelledCheckbox = ({ label, checked, onChange, disabled }: LabelledCheckboxProps) => {
  const id = useId();

  return (
    <label htmlFor={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      <Checkbox id={id} checked={checked} disabled={disabled} onCheckedChange={(next) => onChange(next === true)} />
      <Text render={<span />} color={disabled ? 'tertiary' : 'primary'}>
        {label}
      </Text>
    </label>
  );
};
