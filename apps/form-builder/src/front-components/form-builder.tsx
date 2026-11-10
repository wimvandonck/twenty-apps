import { useCallback, useEffect, useMemo, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useLocation, useTranslate } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { MainButton } from 'twenty-ui/components/input';
import { Status } from 'twenty-ui/primitives/data-display';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button, Field, Input } from 'twenty-ui/primitives/input';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { EMPTY_FORM_DEFINITION } from 'src/constants/empty-form-definition';
import { FORM_BUILDER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { LinksSection } from 'src/front-components/components/links-section';
import { OptionSelect } from 'src/front-components/components/option-select';
import { RecordCard } from 'src/front-components/components/record-card';
import { SettingsSection } from 'src/front-components/components/settings-section';
import { fetchForms } from 'src/twenty-client/fetch-forms';
import { fetchObjectMetadata } from 'src/twenty-client/fetch-object-metadata';
import { type FormDefinition } from 'src/types/form-definition';
import { type FormSummary } from 'src/types/form-summary';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { createFormRecord } from 'src/utils/create-form-record.util';
import { normalizeDefinition } from 'src/utils/normalize-definition.util';
import { parseFormDefinition } from 'src/utils/parse-form-definition.util';
import { sortRecordsByLinks } from 'src/utils/sort-records-by-links.util';

type LoadState =
  | { status: 'LOADING' }
  | { status: 'ERROR'; message: string }
  | { status: 'READY'; objects: ObjectMetadata[] };

type CreatedFormResponse = { data: { createForm: { id: string } } };

const LAST_FORM_KEY = 'form-builder.last-form-id';

const FormBuilder = () => {
  const theme = useTheme();
  const { t } = useTranslate();
  const client = useMemo(() => new RestApiClient(), []);
  // Set when the page is opened from a form record's button.
  const requestedFormId = new URLSearchParams(useLocation()?.search ?? '').get('formId');

  const [loadState, setLoadState] = useState<LoadState>({ status: 'LOADING' });
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [formId, setFormId] = useState<string | null>(null);
  const [definition, setDefinition] = useState<FormDefinition>(EMPTY_FORM_DEFINITION);
  const [isPublished, setIsPublished] = useState(false);
  const [saved, setSaved] = useState({ snapshot: '', isPublished: false });
  const [isSaving, setIsSaving] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const [objectToAdd, setObjectToAdd] = useState('');
  const [tab, setTab] = useState('records');

  const openForm = useCallback((form: FormSummary, objects: ObjectMetadata[]) => {
    const stored = parseFormDefinition(form.definition) ?? { ...EMPTY_FORM_DEFINITION, title: form.name };
    const normalized = normalizeDefinition(stored, objects);

    setFormId(form.id);
    setDefinition(normalized);
    setIsPublished(form.isPublished);
    setSaved({ snapshot: JSON.stringify(normalized), isPublished: form.isPublished });
    localStorage.setItem(LAST_FORM_KEY, form.id);
  }, []);

  const load = useCallback(async () => {
    setLoadState({ status: 'LOADING' });

    try {
      const [objects, loadedForms] = await Promise.all([fetchObjectMetadata(), fetchForms(client)]);
      const preferredFormId = requestedFormId ?? localStorage.getItem(LAST_FORM_KEY);
      const initialForm = loadedForms.find(({ id }) => id === preferredFormId) ?? loadedForms[0];

      setForms(loadedForms);

      if (initialForm !== undefined) {
        openForm(initialForm, objects);
      }

      setLoadState({ status: 'READY', objects });
    } catch (error) {
      setLoadState({ status: 'ERROR', message: error instanceof Error ? error.message : String(error) });
    }
  }, [client, openForm, requestedFormId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loadState.status === 'LOADING') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: theme.spacing[8] }}>
        <Loader />
      </div>
    );
  }

  if (loadState.status === 'ERROR') {
    return (
      <div style={{ padding: theme.spacing[4] }}>
        <Callout
          status="error"
          title={t('The forms could not be loaded')}
          description={loadState.message}
          action={<Callout.Action onClick={() => void load()}>{t('Try again')}</Callout.Action>}
        />
      </div>
    );
  }

  const { objects } = loadState;
  const selectableObjects = objects.filter(({ isSelectable }) => isSelectable);
  const hasCycle = sortRecordsByLinks(definition.records, definition.links) === null;
  const hasVisibleField = definition.records.some(({ fields }) => fields.some(({ hidden }) => hidden !== true));
  const isDirty = JSON.stringify(definition) !== saved.snapshot || isPublished !== saved.isPublished;
  const blocker = hasCycle
    ? t('Fix the link loop before saving.')
    : isPublished && !hasVisibleField
      ? t('Add at least one visible field before publishing.')
      : null;

  const applyDefinition = (changes: Partial<FormDefinition>) =>
    setDefinition((current) => normalizeDefinition({ ...current, ...changes }, objects));

  const createForm = async () => {
    const name = newFormName.trim();

    // Opening another form drops unsaved edits, so it waits for a save.
    if (name === '' || isDirty) {
      return;
    }

    try {
      const response = await client.post<CreatedFormResponse>('/rest/forms', { name });
      const form: FormSummary = { id: response.data.createForm.id, name, isPublished: false, definition: null };

      setForms([form, ...forms]);
      setNewFormName('');
      openForm(form, objects);
    } catch (error) {
      await enqueueSnackbar({
        message: t('Creating the form failed: {error}', { error: error instanceof Error ? error.message : String(error) }),
        variant: 'error',
      });
    }
  };

  const save = async () => {
    if (formId === null) {
      return;
    }

    setIsSaving(true);

    try {
      await client.patch(`/rest/forms/${formId}`, { definition, isPublished });
      setSaved({ snapshot: JSON.stringify(definition), isPublished });
      setForms(forms.map((form) => (form.id === formId ? { ...form, definition, isPublished } : form)));
      await enqueueSnackbar({ message: isPublished ? t('Form saved and live') : t('Form saved'), variant: 'success' });
    } catch (error) {
      await enqueueSnackbar({
        message: t('Saving failed: {error}', { error: error instanceof Error ? error.message : String(error) }),
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addRecord = () => {
    const object = selectableObjects.find(({ nameSingular }) => nameSingular === objectToAdd);

    if (object !== undefined) {
      applyDefinition({
        records: [...definition.records, createFormRecord(object, definition.records.map(({ key }) => key))],
      });
      setObjectToAdd('');
    }
  };

  const panelStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing[4],
    minWidth: 0,
    paddingTop: theme.spacing[4],
  };

  return (
    <main
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[4],
        padding: theme.spacing[4],
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        color: theme.font.color.primary,
        background: theme.background.secondary,
      }}
    >
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing[3], alignItems: 'end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing[3], alignItems: 'end' }}>
          <div style={{ width: 260, maxWidth: '100%' }}>
            <OptionSelect
              label={t('Form')}
              value={formId ?? ''}
              options={forms.map(({ id, name }) => ({ value: id, label: name || t('Untitled form') }))}
              placeholder={t('Choose a form')}
              disabled={isDirty}
              onChange={(id) => {
                const form = forms.find((candidate) => candidate.id === id);

                if (form !== undefined) {
                  openForm(form, objects);
                }
              }}
            />
          </div>
          <div style={{ width: 220, maxWidth: '100%' }}>
            <Field.Root>
              <Field.Label>{t('New form')}</Field.Label>
              <Input
                placeholder={t('Name of the new form')}
                value={newFormName}
                disabled={isDirty}
                onChange={(event) => setNewFormName(event.target.value)}
              />
            </Field.Root>
          </div>
          <Button onClick={() => void createForm()} disabled={isDirty || newFormName.trim() === ''}>
            {t('Create form')}
          </Button>
        </div>
        {formId !== null && (
          <div style={{ display: 'flex', gap: theme.spacing[3], alignItems: 'center' }}>
            {isDirty && (
              <Text size="xs" color="secondary">
                {t('Unsaved changes')}
              </Text>
            )}
            <Status color={saved.isPublished ? 'green' : 'gray'}>{saved.isPublished ? t('Live') : t('Draft')}</Status>
            <MainButton onClick={() => void save()} disabled={!isDirty || blocker !== null} loading={isSaving}>
              {isDirty ? t('Save') : t('Saved')}
            </MainButton>
          </div>
        )}
      </header>
      {blocker !== null && <Callout status="warning" title={blocker} />}
      {formId === null ? (
        <Callout
          status="neutral"
          title={t('No form yet')}
        />
      ) : (
        <Tabs.Root value={tab} onValueChange={(value) => setTab(String(value))}>
          <Tabs.List aria-label={t('Form')}>
            <Tabs.Tab value="records">{t('Records and fields')}</Tabs.Tab>
            <Tabs.Tab value="links">{t('Links between records')}</Tabs.Tab>
            <Tabs.Tab value="settings">{t('Form settings and sharing')}</Tabs.Tab>
            <Tabs.Indicator />
          </Tabs.List>
          <Tabs.Panel value="records">
            <div style={panelStyle}>
              <Text color="secondary">
                {t('Fields Twenty requires are always included; system fields are never offered.')}
              </Text>
              {definition.records.map((record) => (
                <RecordCard
                  key={record.key}
                  record={record}
                  object={objects.find(({ nameSingular }) => nameSingular === record.objectNameSingular)}
                  onChange={(next) =>
                    applyDefinition({
                      records: definition.records.map((current) => (current.key === record.key ? next : current)),
                    })
                  }
                  onRemove={() => applyDefinition({ records: definition.records.filter(({ key }) => key !== record.key) })}
                />
              ))}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing[2], alignItems: 'end' }}>
                <div style={{ flex: '1 1 200px', minWidth: 0, maxWidth: 320 }}>
                  <OptionSelect
                    label={t('Add a record')}
                    value={objectToAdd}
                    options={selectableObjects.map(({ nameSingular, labelSingular }) => ({ value: nameSingular, label: labelSingular }))}
                    placeholder={t('Choose an object')}
                    onChange={setObjectToAdd}
                  />
                </div>
                <Button onClick={addRecord} disabled={objectToAdd === ''}>
                  {t('Add record')}
                </Button>
              </div>
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="links">
            <div style={{ ...panelStyle, maxWidth: 880 }}>
              <LinksSection
                key={formId}
                records={definition.records}
                objects={objects}
                links={definition.links}
                hasCycle={hasCycle}
                onChange={(links) => applyDefinition({ links })}
              />
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="settings">
            <div style={{ ...panelStyle, maxWidth: 880 }}>
              <SettingsSection
                definition={definition}
                isPublished={isPublished}
                isLive={saved.isPublished && !isDirty}
                formUrl={client.resolveUrl(`/s/forms/${formId}`)}
                onDefinitionChange={applyDefinition}
                onPublishedChange={setIsPublished}
              />
            </div>
          </Tabs.Panel>
        </Tabs.Root>
      )}
    </main>
  );
};

export default defineFrontComponent({
  universalIdentifier: FORM_BUILDER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'form-builder',
  description: 'Full-page builder for forms: records, fields, links and sharing.',
  component: FormBuilder,
});
