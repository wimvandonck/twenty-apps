import { Callout } from 'twenty-ui/components/feedback';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { LabelledCheckbox } from 'src/front-components/components/labelled-checkbox';
import { type FormLink } from 'src/types/form-link';
import { type FormRecord } from 'src/types/form-record';
import { type ObjectMetadata } from 'src/types/object-metadata';

type LinksStepProps = {
  records: FormRecord[];
  objects: ObjectMetadata[];
  links: FormLink[];
  availableLinks: FormLink[];
  hasCycle: boolean;
  onChange: (links: FormLink[]) => void;
};

const isSameLink = (a: FormLink, b: FormLink) =>
  a.sourceRecordKey === b.sourceRecordKey &&
  a.relationFieldName === b.relationFieldName &&
  a.targetRecordKey === b.targetRecordKey;

export const LinksStep = ({ records, objects, links, availableLinks, hasCycle, onChange }: LinksStepProps) => {
  const theme = useTheme();
  const recordLabel = (key: string) => records.find((record) => record.key === key)?.label ?? key;
  const fieldLabel = (link: FormLink) => {
    const source = records.find(({ key }) => key === link.sourceRecordKey);
    const object = objects.find(({ nameSingular }) => nameSingular === source?.objectNameSingular);

    return object?.fields.find(({ name }) => name === link.relationFieldName)?.label ?? link.relationFieldName;
  };

  const toggle = (link: FormLink, checked: boolean) => {
    // A relation field holds one record, so a new choice replaces the old one.
    const others = links.filter(
      (existing) =>
        !(existing.sourceRecordKey === link.sourceRecordKey && existing.relationFieldName === link.relationFieldName),
    );

    onChange(checked ? [...others, link] : others);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
      <Text color="secondary">
        Link the records of one submission to each other, for example the new person to the new company.
      </Text>
      {availableLinks.length === 0 && (
        <Callout
          status="neutral"
          title="Nothing to link"
          description="Links appear here when the form has two records whose objects are related, such as Person and Company."
        />
      )}
      {hasCycle && (
        <Callout status="error" title="These links form a loop" description="Remove one of them so the records can be written in order." />
      )}
      {availableLinks.map((link) => (
        <LabelledCheckbox
          key={`${link.sourceRecordKey}.${link.relationFieldName}.${link.targetRecordKey}`}
          label={`Set ${fieldLabel(link)} of ${recordLabel(link.sourceRecordKey)} to ${recordLabel(link.targetRecordKey)}`}
          checked={links.some((existing) => isSameLink(existing, link))}
          onChange={(checked) => toggle(link, checked)}
        />
      ))}
    </div>
  );
};
