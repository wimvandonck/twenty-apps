import { useTranslate } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { LightButton } from 'twenty-ui/components/input';
import { Button, Field, Input } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { LIST_PERSON_OBJECT_NAME_SINGULAR } from 'src/constants/list-objects';
import { LabelledCheckbox } from 'src/front-components/components/labelled-checkbox';
import { OptionSelect } from 'src/front-components/components/option-select';
import { type EmailTypeSummary } from 'src/types/email-type-summary';
import { type FormConsent } from 'src/types/form-consent';
import { type FormRecord } from 'src/types/form-record';

type ConsentsSectionProps = {
  consents: FormConsent[];
  records: FormRecord[];
  // null when the Consents app is not installed.
  emailTypes: EmailTypeSummary[] | null;
  onChange: (consents: FormConsent[]) => void;
};

export const ConsentsSection = ({ consents, records, emailTypes, onChange }: ConsentsSectionProps) => {
  const theme = useTheme();
  const { t } = useTranslate();
  const people = records.filter(({ objectNameSingular }) => objectNameSingular === LIST_PERSON_OBJECT_NAME_SINGULAR);
  const personOptions = people.map(({ key, label }) => ({ value: key, label }));
  const update = (key: string, changes: Partial<FormConsent>) =>
    onChange(consents.map((consent) => (consent.key === key ? { ...consent, ...changes } : consent)));
  const defaultLabel = (emailType: EmailTypeSummary) =>
    emailType.consentText || t('Yes, send me {emailType}', { emailType: emailType.name });

  const add = () => {
    const unused = (emailTypes ?? []).find(({ id }) => !consents.some((consent) => consent.emailTypeId === id));
    const chosen = unused ?? emailTypes?.[0];
    let index = 1;

    while (consents.some(({ key }) => key === `consent${index}`)) {
      index += 1;
    }

    if (chosen !== undefined && people.length > 0) {
      onChange([
        ...consents,
        {
          key: `consent${index}`,
          emailTypeId: chosen.id,
          emailTypeName: chosen.name,
          recordKey: people[0].key,
          label: defaultLabel(chosen),
          required: false,
        },
      ]);
    }
  };

  if (emailTypes === null) {
    return <Callout status="neutral" title={t('Install the Consents app to ask for consent in forms.')} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3], maxWidth: 880 }}>
      <Text color="secondary">
        {t('Ask the person of a submission for consent to an email type. The box starts unticked; the person confirms by email before the consent counts.')}
      </Text>
      {emailTypes.length === 0 && <Callout status="neutral" title={t('Create an email type in Consents first.')} />}
      {people.length === 0 && <Callout status="neutral" title={t('Add a person record to the form first.')} />}
      {consents.map((consent) => {
        const typeOptions = emailTypes.some(({ id }) => id === consent.emailTypeId)
          ? emailTypes
          : [...emailTypes, { id: consent.emailTypeId, name: consent.emailTypeName, consentText: '' }];

        return (
          <div
            key={consent.key}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing[3],
              padding: theme.spacing[4],
              border: `1px solid ${theme.border.color.medium}`,
              borderRadius: theme.border.radius.md,
              background: theme.background.primary,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: theme.spacing[3],
                alignItems: 'end',
              }}
            >
              <OptionSelect
                label={t('Email type')}
                value={consent.emailTypeId}
                options={typeOptions.map(({ id, name }) => ({ value: id, label: name }))}
                onChange={(emailTypeId) => {
                  const chosen = typeOptions.find(({ id }) => id === emailTypeId);
                  const previous = typeOptions.find(({ id }) => id === consent.emailTypeId);

                  if (chosen !== undefined) {
                    update(consent.key, {
                      emailTypeId,
                      emailTypeName: chosen.name,
                      // Follow the email type, unless the text was rewritten.
                      ...(previous === undefined || consent.label === defaultLabel(previous)
                        ? { label: defaultLabel(chosen) }
                        : {}),
                    });
                  }
                }}
              />
              <OptionSelect
                label={t('Person')}
                value={consent.recordKey}
                options={personOptions}
                onChange={(recordKey) => update(consent.key, { recordKey })}
              />
            </div>
            <Field.Root style={{ minWidth: 0 }}>
              <Field.Label>{t('Label of the checkbox')}</Field.Label>
              <Input value={consent.label} onChange={(event) => update(consent.key, { label: event.target.value })} />
            </Field.Root>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing[3] }}>
              <LabelledCheckbox
                label={t('Required to send the form')}
                checked={consent.required}
                onChange={(required) => update(consent.key, { required })}
              />
              <LightButton onClick={() => onChange(consents.filter(({ key }) => key !== consent.key))}>{t('Remove')}</LightButton>
            </div>
          </div>
        );
      })}
      {consents.length === 0 && <Text color="light">{t('No consents yet.')}</Text>}
      <div>
        <Button disabled={emailTypes.length === 0 || people.length === 0} onClick={add}>
          {t('Add consent')}
        </Button>
      </div>
    </div>
  );
};
