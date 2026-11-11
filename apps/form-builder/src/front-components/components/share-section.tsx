import { copyToClipboard, enqueueSnackbar, useTranslate } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { buildEmbedSnippet } from 'src/utils/build-embed-snippet.util';

type ShareSectionProps = {
  isLive: boolean;
  formUrl: string;
  title: string;
};

export const ShareSection = ({ isLive, formUrl, title }: ShareSectionProps) => {
  const theme = useTheme();
  const { t } = useTranslate();
  const snippet = buildEmbedSnippet(formUrl, title);

  const copy = async (text: string) => {
    await copyToClipboard(text);
    await enqueueSnackbar({ message: t('Copied'), variant: 'success' });
  };

  if (!isLive) {
    return (
      <Callout
        status="neutral"
        title={t('Not live yet')}
        description={t('Turn on Published and save to get the public link and the embed code.')}
      />
    );
  }

  const codeStyle = {
    margin: 0,
    padding: theme.spacing[3],
    background: theme.background.primary,
    border: `1px solid ${theme.border.color.medium}`,
    borderRadius: theme.border.radius.sm,
    fontFamily: 'monospace',
    fontSize: 12,
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-all' as const,
  };
  const blockStyle = { display: 'flex', flexDirection: 'column' as const, gap: theme.spacing[2] };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[5] }}>
      <div style={blockStyle}>
        <Text weight="medium">{t('Public link')}</Text>
        <pre style={codeStyle}>{formUrl}</pre>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[3] }}>
          <Button onClick={() => copy(formUrl)}>{t('Copy link')}</Button>
          <a href={formUrl} target="_blank" rel="noreferrer" style={{ color: theme.font.color.secondary }}>
            {t('Open form')}
          </a>
        </div>
      </div>
      <div style={blockStyle}>
        <Text weight="medium">{t('Embed code')}</Text>
        <Text color="secondary">{t('Paste this into the HTML of any page. The form follows the visitor’s language.')}</Text>
        <pre style={codeStyle}>{snippet}</pre>
        <div>
          <Button onClick={() => copy(snippet)}>{t('Copy embed code')}</Button>
        </div>
      </div>
    </div>
  );
};
