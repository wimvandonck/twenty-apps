import { useTranslate } from 'twenty-sdk/front-component';
import { LightButton } from 'twenty-ui/components/input';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { ConditionCard } from 'src/front-components/components/condition-card';
import { OptionSelect } from 'src/front-components/components/option-select';
import { type EditorMetadata } from 'src/types/editor-metadata';
import { type Condition, type Match } from 'src/types/segment-definition';
import { newCondition } from 'src/utils/new-condition.util';

type ConditionListProps = {
  match: Match;
  conditions: Condition[];
  metadata: EditorMetadata;
  onChange: (match: Match, conditions: Condition[]) => void;
};

export const ConditionList = ({ match, conditions, metadata, onChange }: ConditionListProps) => {
  const { t } = useTranslate();
  const theme = useTheme();

  const add = (type: Condition['type']) => onChange(match, [...conditions, newCondition(type, metadata)]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3], minWidth: 0 }}>
      <div style={{ maxWidth: 320 }}>
        <OptionSelect
          label={t('People who meet')}
          value={match}
          options={[
            { value: 'ALL', label: t('all of these conditions') },
            { value: 'ANY', label: t('at least one of these conditions') },
          ]}
          onChange={(next) => onChange(next as Match, conditions)}
        />
      </div>
      {conditions.length === 0 && <Text color="secondary">{t('No conditions yet.')}</Text>}
      {conditions.map((condition, index) => (
        <ConditionCard
          key={index}
          condition={condition}
          metadata={metadata}
          onChange={(next) => onChange(match, conditions.map((current, i) => (i === index ? next : current)))}
          onRemove={() => onChange(match, conditions.filter((_, i) => i !== index))}
        />
      ))}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing[2] }}>
        <LightButton onClick={() => add('related')}>
          + {t('Linked records')}
        </LightButton>
        <LightButton onClick={() => add('property')}>
          + {t('Own field')}
        </LightButton>
        <LightButton onClick={() => add('list')}>
          + {t('List')}
        </LightButton>
        <LightButton onClick={() => add('group')}>
          + {t('Group')}
        </LightButton>
      </div>
    </div>
  );
};
