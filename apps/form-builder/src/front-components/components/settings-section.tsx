import { copyToClipboard, enqueueSnackbar, useTranslate } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { LightButton } from 'twenty-ui/components/input';
import { Field, Input } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { LabelledCheckbox } from 'src/front-components/components/labelled-checkbox';
import { type FormDefinition } from 'src/types/form-definition';
import { buildEmbedSnippet } from 'src/utils/build-embed-snippet.util';

type SettingsSectionProps = {
  definition: FormDefinition;
  isPublished: boolean;
  isLive: boolean;
  formUrl: string;
  onDefinitionChange: (changes: Partial<FormDefinition>) => void;
  onPublishedChange: (isPublished: boolean) => void;
};

export const SettingsSection = ({
  definition,
  isPublished,
  isLive,
  formUrl,
  onDefinitionChange,
  onPublishedChange,
}: SettingsSectionProps) => {
  const theme = useTheme();
  const { t } = useTranslate();
  const snippet = buildEmbedSnippet(formUrl, definition.title);
  const textSettings = [
    { key: 'title', label: t('Title') },
    { key: 'description', label: t('Description') },
    { key: 'submitLabel', label: t('Submit button') },
    { key: 'successMessage', label: t('Message after submitting') },
  ] as const;

  const copy = async (text: string) => {
    await copyToClipboard(text);
    await enqueueSnackbar({ message: t('Copied'), variant: 'success' });
  };

  const codeStyle = {
    margin: 0,
    padding: theme.spacing[3],
    background: theme.background.secondary,
    border: `1px solid ${theme.border.color.light}`,
    borderRadius: theme.border.radius.sm,
    fontFamily: 'monospace',
    fontSize: 12,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-all' as const,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing[3] }}>
        {textSettings.map(({ key, label }) => (
          <Field.Root key={key} style={{ minWidth: 0 }}>
            <Field.Label>{label}</Field.Label>
            <Input value={definition[key]} onChange={(event) => onDefinitionChange({ [key]: event.target.value })} />
          </Field.Root>
        ))}
      </div>
      <LabelledCheckbox
        label={t('Published – anyone with the link can submit')}
        checked={isPublished}
        onChange={onPublishedChange}
      />
      {isLive ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
            <Text weight="medium">{t('Public link')}</Text>
            <pre style={codeStyle}>{formUrl}</pre>
            <div>
              <LightButton onClick={() => copy(formUrl)}>{t('Copy link')}</LightButton>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
            <Text weight="medium">{t('Embed code')}</Text>
            <Text color="secondary">
              {t('Paste this into the HTML of any page. The form follows the visitor’s language.')}
            </Text>
            <pre style={codeStyle}>{snippet}</pre>
            <div>
              <LightButton onClick={() => copy(snippet)}>{t('Copy embed code')}</LightButton>
            </div>
          </div>
        </>
      ) : (
        <Callout
          status="neutral"
          title={t('Not live yet')}
          description={t('Tick Published and save to get the public link and the embed code.')}
        />
      )}
    </div>
  );
};
