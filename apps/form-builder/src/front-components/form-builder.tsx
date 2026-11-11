import { useCallback, useEffect, useMemo, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useLocation, useTranslate } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { LightButton, MainButton } from 'twenty-ui/components/input';
import { Status } from 'twenty-ui/primitives/data-display';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button, Input, Switch } from 'twenty-ui/primitives/input';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { EMPTY_FORM_DEFINITION } from 'src/constants/empty-form-definition';
import { FORM_BUILDER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { FormPreview } from 'src/front-components/components/form-preview';
import { LinksSection } from 'src/front-components/components/links-section';
import { ListsSection } from 'src/front-components/components/lists-section';
import { OptionSelect } from 'src/front-components/components/option-select';
import { RecordCard } from 'src/front-components/components/record-card';
import { SettingsSection } from 'src/front-components/components/settings-section';
import { ShareSection } from 'src/front-components/components/share-section';
import { fetchForms } from 'src/twenty-client/fetch-forms';
import { fetchLists } from 'src/twenty-client/fetch-lists';
import { fetchObjectMetadata } from 'src/twenty-client/fetch-object-metadata';
import { type FormDefinition } from 'src/types/form-definition';
import { type FormSummary } from 'src/types/form-summary';
import { type ListSummary } from 'src/types/list-summary';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { moveItem } from 'src/utils/move-item.util';
import { createFormRecord } from 'src/utils/create-form-record.util';
import { getFormSteps } from 'src/utils/get-form-steps.util';
import { normalizeDefinition } from 'src/utils/normalize-definition.util';
import { parseFormDefinition } from 'src/utils/parse-form-definition.util';
import { sortRecordsByLinks } from 'src/utils/sort-records-by-links.util';

type LoadState =
  | { status: 'LOADING' }
  | { status: 'ERROR'; message: string }
  | { status: 'READY'; objects: ObjectMetadata[]; lists: ListSummary[] | null };

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
  const [newFormName, setNewFormName] = useState<string | null>(null);
  const [tab, setTab] = useState('fields');

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
      const [objects, loadedForms, lists] = await Promise.all([
        fetchObjectMetadata(),
        fetchForms(client),
        fetchLists(client),
      ]);
      const preferredFormId = requestedFormId ?? localStorage.getItem(LAST_FORM_KEY);
      const initialForm = loadedForms.find(({ id }) => id === preferredFormId) ?? loadedForms[0];

      setForms(loadedForms);

      if (initialForm !== undefined) {
        openForm(initialForm, objects);
      }

      setLoadState({ status: 'READY', objects, lists });
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
  const hasVisibleField = getFormSteps(definition).length > 0;
  const isDirty = JSON.stringify(definition) !== saved.snapshot || isPublished !== saved.isPublished;
  const blocker = hasCycle
    ? t('Fix the link loop before saving.')
    : isPublished && !hasVisibleField
      ? t('Add at least one visible field before publishing.')
      : null;

  const applyDefinition = (changes: Partial<FormDefinition>) =>
    setDefinition((current) => normalizeDefinition({ ...current, ...changes }, objects));

  const createForm = async () => {
    const name = (newFormName ?? '').trim();

    if (name === '') {
      return;
    }

    try {
      const response = await client.post<CreatedFormResponse>('/rest/forms', { name });
      const form: FormSummary = { id: response.data.createForm.id, name, isPublished: false, definition: null };

      setForms([form, ...forms]);
      setNewFormName(null);
      setTab('fields');
      openForm(form, objects);
    } catch (error) {
      await enqueueSnackbar({
        message: t('Creating the form failed: {error}', { error: error instanceof Error ? error.message : String(error) }),
        variant: 'error',
      });
    }
  };

  const discard = () => {
    setDefinition(JSON.parse(saved.snapshot) as FormDefinition);
    setIsPublished(saved.isPublished);
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

  const addRecord = (objectNameSingular: string) => {
    const object = selectableObjects.find(({ nameSingular }) => nameSingular === objectNameSingular);

    if (object !== undefined) {
      applyDefinition({
        records: [...definition.records, createFormRecord(object, definition.records.map(({ key }) => key))],
      });
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
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing[3], alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing[2], alignItems: 'center' }}>
          {newFormName === null ? (
            <>
              <div style={{ width: 260, maxWidth: '100%' }}>
                <OptionSelect
                  label={t('Form')}
                  hideLabel
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
              <Button disabled={isDirty} onClick={() => setNewFormName('')}>
                {t('New form')}
              </Button>
            </>
          ) : (
            <>
              <div style={{ width: 260, maxWidth: '100%' }}>
                <Input
                  aria-label={t('Name of the new form')}
                  placeholder={t('Name of the new form')}
                  autoFocus
                  value={newFormName}
                  onChange={(event) => setNewFormName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      void createForm();
                    }
                  }}
                />
              </div>
              <Button onClick={() => void createForm()} disabled={newFormName.trim() === ''}>
                {t('Create form')}
              </Button>
              <LightButton onClick={() => setNewFormName(null)}>{t('Cancel')}</LightButton>
            </>
          )}
          {isDirty && (
            <Text size="xs" color="secondary">
              {t('Save or discard your changes to switch forms.')}
            </Text>
          )}
        </div>
        {formId !== null && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing[3], alignItems: 'center' }}>
            <Status color={saved.isPublished ? 'green' : 'gray'}>{saved.isPublished ? t('Live') : t('Draft')}</Status>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: theme.spacing[2] }}>
              <Switch size="sm" checked={isPublished} onCheckedChange={(checked) => setIsPublished(checked === true)} />
              <Text render={<span />}>{t('Published')}</Text>
            </label>
            {isDirty && <LightButton onClick={discard}>{t('Discard changes')}</LightButton>}
            <MainButton size="sm" onClick={() => void save()} disabled={!isDirty || blocker !== null} loading={isSaving}>
              {isDirty ? t('Save') : t('Saved')}
            </MainButton>
          </div>
        )}
      </header>
      {blocker !== null && <Callout status="warning" title={blocker} />}
      {formId === null ? (
        <Callout status="neutral" title={t('No form yet')} description={t('Choose New form to create your first form.')} />
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing[6], alignItems: 'flex-start' }}>
          <div style={{ flex: '3 1 560px', minWidth: 0 }}>
            <Tabs.Root value={tab} onValueChange={(value) => setTab(String(value))}>
              <Tabs.List aria-label={t('Form')}>
                <Tabs.Tab value="fields">{t('Fields')}</Tabs.Tab>
                <Tabs.Tab value="links">{t('Links')}</Tabs.Tab>
                <Tabs.Tab value="lists">{t('Lists')}</Tabs.Tab>
                <Tabs.Tab value="settings">{t('Settings')}</Tabs.Tab>
                <Tabs.Tab value="share">{t('Share')}</Tabs.Tab>
                <Tabs.Indicator />
              </Tabs.List>
              <Tabs.Panel value="fields">
                <div style={panelStyle}>
                  <Text color="secondary">
                    {t('Add the records a submission creates or updates, then the fields to ask for. Fields Twenty requires are added automatically.')}
                  </Text>
                  {definition.records.map((record, index) => (
                    <RecordCard
                      key={record.key}
                      record={record}
                      object={objects.find(({ nameSingular }) => nameSingular === record.objectNameSingular)}
                      isFirst={index === 0}
                      isLast={index === definition.records.length - 1}
                      onChange={(next) =>
                        applyDefinition({
                          records: definition.records.map((current) => (current.key === record.key ? next : current)),
                        })
                      }
                      onMove={(offset) => applyDefinition({ records: moveItem(definition.records, index, offset) })}
                      onRemove={() => applyDefinition({ records: definition.records.filter(({ key }) => key !== record.key) })}
                    />
                  ))}
                  <div style={{ maxWidth: 320 }}>
                    <OptionSelect
                      label={t('Add a record')}
                      value=""
                      options={selectableObjects.map(({ nameSingular, labelSingular }) => ({ value: nameSingular, label: labelSingular }))}
                      placeholder={t('Choose an object')}
                      onChange={addRecord}
                    />
                  </div>
                </div>
              </Tabs.Panel>
              <Tabs.Panel value="links">
                <div style={panelStyle}>
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
              <Tabs.Panel value="lists">
                <div style={panelStyle}>
                  <ListsSection
                    lists={definition.lists}
                    records={definition.records}
                    availableLists={loadState.lists}
                    onChange={(lists) => applyDefinition({ lists })}
                  />
                </div>
              </Tabs.Panel>
              <Tabs.Panel value="settings">
                <div style={panelStyle}>
                  <SettingsSection definition={definition} onChange={applyDefinition} />
                </div>
              </Tabs.Panel>
              <Tabs.Panel value="share">
                <div style={panelStyle}>
                  <ShareSection
                    isLive={saved.isPublished && !isDirty}
                    formUrl={client.resolveUrl(`/s/forms/${formId}`)}
                    title={definition.title}
                  />
                </div>
              </Tabs.Panel>
            </Tabs.Root>
          </div>
          <div style={{ flex: '2 1 320px', minWidth: 0, maxWidth: 480, position: 'sticky', top: 0 }}>
            <FormPreview definition={definition} />
          </div>
        </div>
      )}
    </main>
  );
};

export default defineFrontComponent({
  universalIdentifier: FORM_BUILDER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'form-builder',
  description: 'Full-page builder for forms: records, fields, steps, links, lists and sharing.',
  component: FormBuilder,
});
