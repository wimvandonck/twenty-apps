import { useCallback, useEffect, useMemo, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent, PageLayoutType } from 'twenty-sdk/define';
import { enqueueSnackbar, useSelectedRecordIds } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { MainButton, SegmentedControl } from 'twenty-ui/components/input';
import { Status } from 'twenty-ui/primitives/data-display';
import { Loader } from 'twenty-ui/primitives/feedback';
import { useTheme } from 'twenty-ui/theme';

import { EMPTY_FORM_DEFINITION } from 'src/constants/empty-form-definition';
import {
  FORM_BUILDER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  FORM_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { FieldsStep } from 'src/front-components/components/fields-step';
import { LinksStep } from 'src/front-components/components/links-step';
import { PublishStep } from 'src/front-components/components/publish-step';
import { RecordsStep } from 'src/front-components/components/records-step';
import { fetchObjectMetadata } from 'src/twenty-client/fetch-object-metadata';
import { type FormDefinition } from 'src/types/form-definition';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { getAvailableLinks } from 'src/utils/get-available-links.util';
import { normalizeDefinition } from 'src/utils/normalize-definition.util';
import { parseFormDefinition } from 'src/utils/parse-form-definition.util';
import { sortRecordsByLinks } from 'src/utils/sort-records-by-links.util';

type FormResponse = {
  data: { form: { name: string; isPublished: boolean | null; definition: unknown } };
};

type LoadState =
  | { status: 'LOADING' }
  | { status: 'ERROR'; message: string }
  | { status: 'READY'; objects: ObjectMetadata[] };

const STEPS = [
  { value: 'records', label: '1. Records' },
  { value: 'links', label: '2. Links' },
  { value: 'fields', label: '3. Fields' },
  { value: 'publish', label: '4. Publish' },
];

const FormBuilder = () => {
  const theme = useTheme();
  const selectedRecordIds = useSelectedRecordIds();
  const formId = selectedRecordIds.length === 1 ? selectedRecordIds[0] : null;
  const client = useMemo(() => new RestApiClient(), []);

  const [loadState, setLoadState] = useState<LoadState>({ status: 'LOADING' });
  const [step, setStep] = useState('records');
  const [definition, setDefinition] = useState<FormDefinition>(EMPTY_FORM_DEFINITION);
  const [isPublished, setIsPublished] = useState(false);
  const [saved, setSaved] = useState({ snapshot: '', isPublished: false });
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (formId === null) {
      return;
    }

    setLoadState({ status: 'LOADING' });

    try {
      const [objects, response] = await Promise.all([
        fetchObjectMetadata(),
        client.get<FormResponse>(`/rest/forms/${formId}`),
      ]);
      const form = response.data.form;
      const stored = parseFormDefinition(form.definition) ?? {
        ...EMPTY_FORM_DEFINITION,
        title: form.name ?? '',
      };

      setDefinition(normalizeDefinition(stored, objects));
      setIsPublished(form.isPublished === true);
      setSaved({ snapshot: JSON.stringify(stored), isPublished: form.isPublished === true });
      setLoadState({ status: 'READY', objects });
    } catch (error) {
      setLoadState({
        status: 'ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [client, formId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (formId === null) {
    return <Callout status="neutral" title="Open a form" description="The builder works on one form at a time." />;
  }

  if (loadState.status === 'LOADING') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: theme.spacing[8] }}>
        <Loader />
      </div>
    );
  }

  if (loadState.status === 'ERROR') {
    return (
      <Callout
        status="error"
        title="The form could not be loaded"
        description={loadState.message}
        action={<Callout.Action onClick={() => void load()}>Try again</Callout.Action>}
      />
    );
  }

  const { objects } = loadState;
  const availableLinks = getAvailableLinks(definition.records, objects);
  const hasCycle = sortRecordsByLinks(definition.records, definition.links) === null;
  const hasFields = definition.records.some(({ fields }) => fields.length > 0);
  const isDirty = JSON.stringify(definition) !== saved.snapshot || isPublished !== saved.isPublished;
  const blocker = hasCycle
    ? 'Fix the link loop in step 2 before saving.'
    : isPublished && !hasFields
      ? 'Add at least one record with a field before publishing.'
      : null;

  const applyDefinition = (changes: Partial<FormDefinition>) =>
    setDefinition((current) => normalizeDefinition({ ...current, ...changes }, objects));

  const save = async () => {
    setIsSaving(true);

    try {
      await client.patch(`/rest/forms/${formId}`, { definition, isPublished });
      setSaved({ snapshot: JSON.stringify(definition), isPublished });
      await enqueueSnackbar({ message: isPublished ? 'Form saved and live' : 'Form saved', variant: 'success' });
    } catch (error) {
      await enqueueSnackbar({
        message: `Saving failed: ${error instanceof Error ? error.message : 'unknown error'}`,
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[4],
        padding: theme.spacing[4],
        width: '100%',
        color: theme.font.color.primary,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing[3], alignItems: 'center', justifyContent: 'space-between' }}>
        <SegmentedControl aria-label="Builder step" value={step} onValueChange={setStep} options={STEPS} />
        <div style={{ display: 'flex', gap: theme.spacing[3], alignItems: 'center' }}>
          <Status color={saved.isPublished ? 'green' : 'gray'}>{saved.isPublished ? 'Live' : 'Draft'}</Status>
          <MainButton size="sm" onClick={() => void save()} disabled={!isDirty || blocker !== null} loading={isSaving}>
            {isDirty ? 'Save' : 'Saved'}
          </MainButton>
        </div>
      </div>
      {blocker !== null && <Callout status="warning" title={blocker} />}
      {step === 'records' && (
        <RecordsStep records={definition.records} objects={objects} onChange={(records) => applyDefinition({ records })} />
      )}
      {step === 'links' && (
        <LinksStep
          records={definition.records}
          objects={objects}
          links={definition.links}
          availableLinks={availableLinks}
          hasCycle={hasCycle}
          onChange={(links) => applyDefinition({ links })}
        />
      )}
      {step === 'fields' && (
        <FieldsStep records={definition.records} objects={objects} onChange={(records) => applyDefinition({ records })} />
      )}
      {step === 'publish' && (
        <PublishStep
          definition={definition}
          isPublished={isPublished}
          isSavedAndPublished={saved.isPublished && !isDirty}
          formUrl={client.resolveUrl(`/s/forms/${formId}`)}
          onDefinitionChange={applyDefinition}
          onPublishedChange={setIsPublished}
        />
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: FORM_BUILDER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'form-builder',
  description: 'Builds a form in four steps: records, links, fields and publishing.',
  component: FormBuilder,
  widgetAvailability: {
    pageLayoutType: PageLayoutType.RECORD_PAGE,
    objectUniversalIdentifiers: [FORM_OBJECT_UNIVERSAL_IDENTIFIER],
  },
});
