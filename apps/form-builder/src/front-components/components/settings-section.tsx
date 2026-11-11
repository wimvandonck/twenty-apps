import { useTranslate } from 'twenty-sdk/front-component';
import { Field, Input, Textarea } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';

import { type FormDefinition } from 'src/types/form-definition';

type SettingsSectionProps = {
  definition: FormDefinition;
  onChange: (changes: Partial<FormDefinition>) => void;
};

export const SettingsSection = ({ definition, onChange }: SettingsSectionProps) => {
  const theme = useTheme();
  const { t } = useTranslate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
      <Field.Root>
        <Field.Label>{t('Title')}</Field.Label>
        <Input value={definition.title} onChange={(event) => onChange({ title: event.target.value })} />
      </Field.Root>
      <Field.Root>
        <Field.Label>{t('Description')}</Field.Label>
        <Textarea
          rows={3}
          value={definition.description}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </Field.Root>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing[3] }}>
        <Field.Root style={{ minWidth: 0 }}>
          <Field.Label>{t('Submit button')}</Field.Label>
          <Input value={definition.submitLabel} onChange={(event) => onChange({ submitLabel: event.target.value })} />
        </Field.Root>
        <Field.Root style={{ minWidth: 0 }}>
          <Field.Label>{t('Message after submitting')}</Field.Label>
          <Input value={definition.successMessage} onChange={(event) => onChange({ successMessage: event.target.value })} />
        </Field.Root>
      </div>
    </div>
  );
};
