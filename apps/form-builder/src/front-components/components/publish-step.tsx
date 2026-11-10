import { copyToClipboard, enqueueSnackbar } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { LightButton } from 'twenty-ui/components/input';
import { Field, Input } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { LabelledCheckbox } from 'src/front-components/components/labelled-checkbox';
import { type FormDefinition } from 'src/types/form-definition';
import { buildEmbedSnippet } from 'src/utils/build-embed-snippet.util';

type PublishStepProps = {
  definition: FormDefinition;
  isPublished: boolean;
  isSavedAndPublished: boolean;
  formUrl: string;
  onDefinitionChange: (changes: Partial<FormDefinition>) => void;
  onPublishedChange: (isPublished: boolean) => void;
};

const TEXT_SETTINGS = [
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'submitLabel', label: 'Submit button' },
  { key: 'successMessage', label: 'Message after submitting' },
] as const;

export const PublishStep = ({
  definition,
  isPublished,
  isSavedAndPublished,
  formUrl,
  onDefinitionChange,
  onPublishedChange,
}: PublishStepProps) => {
  const theme = useTheme();
  const snippet = buildEmbedSnippet(formUrl, definition.title);

  const copy = async (text: string, what: string) => {
    await copyToClipboard(text);
    await enqueueSnackbar({ message: `${what} copied`, variant: 'success' });
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: theme.spacing[3] }}>
        {TEXT_SETTINGS.map(({ key, label }) => (
          <Field.Root key={key} style={{ minWidth: 0 }}>
            <Field.Label>{label}</Field.Label>
            <Input value={definition[key]} onChange={(event) => onDefinitionChange({ [key]: event.target.value })} />
          </Field.Root>
        ))}
      </div>
      <LabelledCheckbox label="Published – anyone with the link can submit" checked={isPublished} onChange={onPublishedChange} />
      {isSavedAndPublished ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
            <Text weight="medium">Public link</Text>
            <pre style={codeStyle}>{formUrl}</pre>
            <div>
              <LightButton onClick={() => copy(formUrl, 'Link')}>Copy link</LightButton>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
            <Text weight="medium">Embed code</Text>
            <Text color="secondary">Paste this into the HTML of any page. The form resizes itself.</Text>
            <pre style={codeStyle}>{snippet}</pre>
            <div>
              <LightButton onClick={() => copy(snippet, 'Embed code')}>Copy embed code</LightButton>
            </div>
          </div>
        </>
      ) : (
        <Callout
          status="neutral"
          title="Not live yet"
          description="Tick Published and save to get the public link and the embed code."
        />
      )}
    </div>
  );
};
