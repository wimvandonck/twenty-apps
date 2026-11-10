import { useState } from 'react';
import { useTranslate } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { LightButton } from 'twenty-ui/components/input';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { OptionSelect } from 'src/front-components/components/option-select';
import { type FormLink } from 'src/types/form-link';
import { type FormRecord } from 'src/types/form-record';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { describeLink } from 'src/utils/describe-link.util';
import { getLinkPaths } from 'src/utils/get-link-paths.util';
import { isSameLink } from 'src/utils/is-same-link.util';
import { replaceLink } from 'src/utils/replace-link.util';

type LinksSectionProps = {
  records: FormRecord[];
  objects: ObjectMetadata[];
  links: FormLink[];
  hasCycle: boolean;
  onChange: (links: FormLink[]) => void;
};

// A row whose two ends are not both chosen yet, or cannot be linked.
type Draft = { id: number; a: string; b: string };

export const LinksSection = ({ records, objects, links, hasCycle, onChange }: LinksSectionProps) => {
  const theme = useTheme();
  const { t } = useTranslate();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const recordOptions = records.map(({ key, label }) => ({ value: key, label }));
  const pathsBetween = (a: string, b: string) => {
    const recordA = records.find(({ key }) => key === a);
    const recordB = records.find(({ key }) => key === b);

    return recordA === undefined || recordB === undefined ? [] : getLinkPaths(recordA, recordB, objects);
  };

  // Called when either end of a row changes: commit the row as a link when
  // the two records can be linked, otherwise keep it as a draft.
  const setEnds = (a: string, b: string, linkIndex: number | null, draftId: number | null) => {
    const [path] = pathsBetween(a, b);
    const withoutDraft = drafts.filter(({ id }) => id !== draftId);

    if (path !== undefined) {
      setDrafts(withoutDraft);
      onChange(replaceLink(links, linkIndex, path));
    } else {
      setDrafts([...withoutDraft, { id: draftId ?? Date.now(), a, b }]);

      if (linkIndex !== null) {
        onChange(links.filter((_, index) => index !== linkIndex));
      }
    }
  };

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr) minmax(0, 1fr) auto',
    gap: theme.spacing[2],
    alignItems: 'center',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
      <Text color="secondary">
        {t('Connect the records of one submission, for example the new person to the new company.')}
      </Text>
      {hasCycle && (
        <Callout
          status="error"
          title={t('These links form a loop')}
        />
      )}
      {links.map((link, index) => {
        const paths = pathsBetween(link.sourceRecordKey, link.targetRecordKey);

        return (
          <div key={`link-${index}`} style={rowStyle}>
            <OptionSelect
              label={t('First record')}
              hideLabel
              value={link.sourceRecordKey}
              options={recordOptions}
              onChange={(a) => setEnds(a, link.targetRecordKey, index, null)}
            />
            <Text color="tertiary">↔</Text>
            <OptionSelect
              label={t('Second record')}
              hideLabel
              value={link.targetRecordKey}
              options={recordOptions}
              onChange={(b) => setEnds(link.sourceRecordKey, b, index, null)}
            />
            {paths.length > 1 ? (
              <OptionSelect
                label={t('Linked through')}
                hideLabel
                value={String(paths.findIndex((path) => isSameLink(path, link)))}
                options={paths.map((path, position) => ({
                  value: String(position),
                  label: describeLink(path, records, objects),
                }))}
                onChange={(position) => onChange(replaceLink(links, index, paths[Number(position)]))}
              />
            ) : (
              <Text size="xs" color="light" truncate>
                {t('via {relation}', { relation: describeLink(link, records, objects) })}
              </Text>
            )}
            <LightButton onClick={() => onChange(links.filter((_, position) => position !== index))}>
              {t('Remove')}
            </LightButton>
          </div>
        );
      })}
      {drafts.map((draft) => (
        <div key={draft.id} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[1] }}>
          <div style={rowStyle}>
            <OptionSelect
              label={t('First record')}
              hideLabel
              value={draft.a}
              options={recordOptions}
              placeholder={t('Choose a record')}
              onChange={(a) => setEnds(a, draft.b, null, draft.id)}
            />
            <Text color="tertiary">↔</Text>
            <OptionSelect
              label={t('Second record')}
              hideLabel
              value={draft.b}
              options={recordOptions}
              placeholder={t('Choose a record')}
              onChange={(b) => setEnds(draft.a, b, null, draft.id)}
            />
            <span />
            <LightButton onClick={() => setDrafts(drafts.filter(({ id }) => id !== draft.id))}>{t('Remove')}</LightButton>
          </div>
          {draft.a !== '' && draft.b !== '' && (
            <Text size="xs" color="secondary">
              {t('These two records cannot be linked: their objects have no relation in Twenty. Add a relation field in Settings → Data model first.')}
            </Text>
          )}
        </div>
      ))}
      <div>
        <Button
          disabled={records.length < 2}
          onClick={() => setDrafts([...drafts, { id: Date.now(), a: '', b: '' }])}
        >
          {t('Add link')}
        </Button>
      </div>
    </div>
  );
};
