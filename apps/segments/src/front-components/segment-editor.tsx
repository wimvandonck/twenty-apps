import { useCallback, useEffect, useMemo, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent, PageLayoutType } from 'twenty-sdk/define';
import { enqueueSnackbar, useSelectedRecordIds, useTranslate } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { LightButton, MainButton } from 'twenty-ui/components/input';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { SEGMENT_EDITOR_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER, SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/data-model';
import { ConditionList } from 'src/front-components/components/condition-list';
import { createTwentyApi } from 'src/twenty-client/create-twenty-api';
import { fetchEditorMetadata } from 'src/twenty-client/fetch-editor-metadata';
import { type EditorMetadata } from 'src/types/editor-metadata';
import { type SegmentDefinition } from 'src/types/segment-definition';
import { evaluateDefinition } from 'src/utils/evaluate-definition.util';
import { isConditionComplete } from 'src/utils/is-condition-complete.util';
import { parseDefinition } from 'src/utils/parse-definition.util';

const EMPTY: SegmentDefinition = { match: 'ALL', conditions: [] };
const SAMPLE_SIZE = 5;

type Preview =
  | { status: 'INCOMPLETE' }
  | { status: 'COUNTING' }
  | { status: 'READY'; count: number; names: string[] }
  | { status: 'ERROR'; message: string };

type GraphqlResponse<T> = { data?: T; errors?: { message: string }[] };

const SegmentEditor = () => {
  const { t } = useTranslate();
  const theme = useTheme();
  const client = useMemo(() => new RestApiClient(), []);
  const api = useMemo(() => createTwentyApi(client), [client]);
  const selected = useSelectedRecordIds();
  const segmentId = selected.length === 1 ? selected[0] : null;

  const [metadata, setMetadata] = useState<EditorMetadata | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [definition, setDefinition] = useState<SegmentDefinition>(EMPTY);
  const [saved, setSaved] = useState('');
  const [preview, setPreview] = useState<Preview>({ status: 'INCOMPLETE' });
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!segmentId) {
      return;
    }

    setLoadError(null);

    try {
      const [nextMetadata, segment] = await Promise.all([fetchEditorMetadata(client), api.fetchSegment(segmentId)]);
      let stored = EMPTY;

      try {
        stored = segment?.definition ? parseDefinition(segment.definition) : EMPTY;
      } catch {
        stored = EMPTY;
      }

      setMetadata(nextMetadata);
      setDefinition(stored);
      setSaved(JSON.stringify(stored));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));
    }
  }, [api, client, segmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const isComplete = definition.conditions.length > 0 && definition.conditions.every(isConditionComplete);
  const isDirty = JSON.stringify(definition) !== saved;

  // Counts who matches a moment after the last change.
  useEffect(() => {
    if (!metadata || !isComplete) {
      setPreview({ status: 'INCOMPLETE' });
      return;
    }

    let isCurrent = true;
    setPreview({ status: 'COUNTING' });

    const timer = setTimeout(async () => {
      try {
        const matched = [...(await evaluateDefinition(definition, api.deps))];
        const sample = matched.slice(0, SAMPLE_SIZE);
        const names =
          sample.length === 0
            ? []
            : (
                await client.post<
                  GraphqlResponse<{ people: { edges: { node: { name: { firstName: string; lastName: string } } }[] } }>
                >('/graphql', {
                  query: 'query ($ids: [UUID!]) { people(filter: { id: { in: $ids } }) { edges { node { name { firstName lastName } } } } }',
                  variables: { ids: sample },
                })
              ).data?.people.edges.map(({ node }) => `${node.name.firstName} ${node.name.lastName}`.trim()) ?? [];

        if (isCurrent) {
          setPreview({ status: 'READY', count: matched.length, names });
        }
      } catch (error) {
        if (isCurrent) {
          setPreview({ status: 'ERROR', message: error instanceof Error ? error.message : String(error) });
        }
      }
    }, 600);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [api, client, definition, isComplete, metadata]);

  const save = async () => {
    if (!segmentId) {
      return;
    }

    setIsSaving(true);

    try {
      await api.updateSegment(segmentId, { definition });
      setSaved(JSON.stringify(definition));
      await enqueueSnackbar({ message: t('Conditions saved. The list is being updated.'), variant: 'success' });
    } catch (error) {
      await enqueueSnackbar({
        message: t('Saving failed: {error}', { error: error instanceof Error ? error.message : String(error) }),
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!segmentId) {
    return <Callout status="neutral" title={t('Open a segment to edit its conditions.')} />;
  }

  if (loadError) {
    return (
      <Callout
        status="error"
        title={t('The conditions could not be loaded')}
        description={loadError}
        action={<Callout.Action onClick={() => void load()}>{t('Try again')}</Callout.Action>}
      />
    );
  }

  if (!metadata) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: theme.spacing[4] }}>
        <Loader />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4], minWidth: 0 }}>
      <ConditionList
        match={definition.match}
        conditions={definition.conditions}
        metadata={metadata}
        onChange={(match, conditions) => setDefinition({ match, conditions })}
      />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing[3],
          borderTop: `1px solid ${theme.border.color.light}`,
          paddingTop: theme.spacing[3],
        }}
      >
        <div style={{ minWidth: 0, flex: '1 1 240px' }} aria-live="polite">
          {preview.status === 'INCOMPLETE' && <Text color="secondary">{t('Fill in every condition to see who matches.')}</Text>}
          {preview.status === 'COUNTING' && <Text color="secondary">{t('Counting…')}</Text>}
          {preview.status === 'ERROR' && <Callout status="error" title={t('Counting failed')} description={preview.message} />}
          {preview.status === 'READY' && (
            <>
              <Text weight="medium">{t('{count} people match', { count: String(preview.count) })}</Text>
              {preview.names.length > 0 && (
                <Text color="secondary">
                  {t('For example')}: {preview.names.join(', ')}
                  {preview.count > preview.names.length ? '…' : ''}
                </Text>
              )}
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: theme.spacing[2] }}>
          <LightButton disabled={!isDirty || isSaving} onClick={() => setDefinition(JSON.parse(saved || JSON.stringify(EMPTY)))}>
            {t('Discard')}
          </LightButton>
          <MainButton size="sm" disabled={!isDirty || !isComplete} loading={isSaving} onClick={() => void save()}>
            {isDirty ? t('Save') : t('Saved')}
          </MainButton>
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: SEGMENT_EDITOR_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'segment-editor',
  description: 'Builds the conditions of a segment and shows who matches',
  component: SegmentEditor,
  widgetAvailability: {
    pageLayoutType: PageLayoutType.RECORD_PAGE,
    objectUniversalIdentifiers: [SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER],
  },
});
