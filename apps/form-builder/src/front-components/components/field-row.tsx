import { useTranslate } from 'twenty-sdk/front-component';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconArrowDown, IconArrowUp, IconX } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Input } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { DefaultValueInput } from 'src/front-components/components/default-value-input';
import { LabelledCheckbox } from 'src/front-components/components/labelled-checkbox';
import { type FormField } from 'src/types/form-field';
import { hasUsableDefault } from 'src/utils/has-usable-default.util';
import { isPageBreak } from 'src/utils/is-page-break.util';

type FieldRowProps = {
  field: FormField;
  // The field's name in Twenty, shown next to the label visitors see.
  sourceLabel: string;
  isRequiredByTwenty: boolean;
  isMatchField: boolean;
  isFirst: boolean;
  isLast: boolean;
  onChange: (changes: Partial<FormField>) => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
};

export const FieldRow = ({
  field,
  sourceLabel,
  isRequiredByTwenty,
  isMatchField,
  isFirst,
  isLast,
  onChange,
  onMove,
  onRemove,
}: FieldRowProps) => {
  const theme = useTheme();
  const { t } = useTranslate();
  const isLocked = isRequiredByTwenty || isMatchField;
  const canHide = !field.required || hasUsableDefault(field);
  const actions = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <LightIconButton aria-label={`${t('Move up')}: ${sourceLabel}`} disabled={isFirst} onClick={() => onMove(-1)}>
        <IconArrowUp />
      </LightIconButton>
      <LightIconButton aria-label={`${t('Move down')}: ${sourceLabel}`} disabled={isLast} onClick={() => onMove(1)}>
        <IconArrowDown />
      </LightIconButton>
      <LightIconButton aria-label={`${t('Remove')}: ${sourceLabel}`} disabled={isLocked} onClick={onRemove}>
        <IconX />
      </LightIconButton>
    </div>
  );

  // A page break only has a title, shown above the step it starts.
  if (isPageBreak(field)) {
    return (
      <div style={{ display: 'contents' }}>
        <div style={{ display: 'flex', alignItems: 'center', minHeight: 32 }}>
          <Tag color="purple">{t('Page break')}</Tag>
        </div>
        <div style={{ gridColumn: 'span 4', minWidth: 0 }}>
          <Input
            aria-label={t('Step title (optional)')}
            placeholder={t('Step title (optional)')}
            value={field.label}
            onChange={(event) => onChange({ label: event.target.value })}
          />
        </div>
        {actions}
      </div>
    );
  }

  return (
    <div style={{ display: 'contents' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing[2], minWidth: 0, minHeight: 32 }}>
        <Text truncate>{sourceLabel}</Text>
        {isRequiredByTwenty && <Tag color="red">{t('Required by Twenty')}</Tag>}
        {isMatchField && <Tag color="blue">{t('Used to match')}</Tag>}
      </div>
      <Input
        aria-label={`${t('Label on the form')}: ${sourceLabel}`}
        value={field.label}
        onChange={(event) => onChange({ label: event.target.value })}
      />
      <DefaultValueInput field={field} onChange={(defaultValue) => onChange({ defaultValue })} />
      <LabelledCheckbox
        label={`${t('Required')}: ${sourceLabel}`}
        hideLabel
        checked={field.required}
        disabled={isLocked}
        onChange={(required) => onChange({ required })}
      />
      <span title={canHide ? undefined : t('Set a default value first to hide a required field.')}>
        <LabelledCheckbox
          label={`${t('Hidden')}: ${sourceLabel}`}
          hideLabel
          checked={field.hidden === true}
          disabled={!canHide}
          onChange={(hidden) => onChange({ hidden })}
        />
      </span>
      {actions}
    </div>
  );
};
