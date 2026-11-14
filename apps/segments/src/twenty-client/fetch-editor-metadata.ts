import { type RestApiClient } from 'twenty-client-sdk/rest';

import { type EditorMetadata } from 'src/types/editor-metadata';

type Response<T> = { data?: T; errors?: { message: string }[] };

type ObjectNode = {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  isActive: boolean;
  isSystem: boolean;
  isRemote: boolean;
  fieldsList: Array<{
    name: string;
    label: string;
    type: string;
    isActive: boolean;
    isSystem: boolean;
    options: unknown;
    relation: { type: string; targetObjectMetadata: { nameSingular: string } } | null;
  }>;
};

const unwrap = <T>(response: Response<T>): T => {
  if (!response.data) {
    throw new Error(response.errors?.map((error) => error.message).join('; ') ?? 'Twenty returned no data');
  }

  return response.data;
};

// Objects, fields, saved table views and lists, for the segment editor.
export const fetchEditorMetadata = async (client: RestApiClient): Promise<EditorMetadata> => {
  const metadata = unwrap(
    await client.post<Response<{ objects: { edges: { node: ObjectNode }[] }; getViews: Array<{ id: string; name: string; objectMetadataId: string; type: string }> }>>(
      '/metadata',
      {
        query: `{
          objects(paging: { first: 500 }) { edges { node {
            id nameSingular namePlural labelSingular labelPlural isActive isSystem isRemote
            fieldsList { name label type isActive isSystem options relation { type targetObjectMetadata { nameSingular } } }
          } } }
          getViews { id name objectMetadataId type }
        }`,
      },
    ),
  );

  const lists = unwrap(
    await client.post<Response<{ messageLists: { edges: { node: { id: string; name: string } }[] } }>>('/graphql', {
      query: '{ messageLists(first: 200) { edges { node { id name } } } }',
    }),
  );

  return {
    objects: metadata.objects.edges
      .map(({ node }) => node)
      .filter((node) => node.isActive && !node.isSystem && !node.isRemote)
      .map((node) => ({
        id: node.id,
        nameSingular: node.nameSingular,
        namePlural: node.namePlural,
        labelSingular: node.labelSingular,
        labelPlural: node.labelPlural,
        fields: node.fieldsList
          .filter((field) => field.isActive && !field.isSystem)
          .map((field) => ({
            name: field.name,
            label: field.label,
            type: field.type,
            options: Array.isArray(field.options) ? field.options : null,
            relationTarget:
              field.relation?.type === 'MANY_TO_ONE' ? field.relation.targetObjectMetadata.nameSingular : null,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      }))
      .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural)),
    views: metadata.getViews
      .filter((view) => view.type === 'TABLE')
      .map((view) => ({ id: view.id, name: view.name, objectId: view.objectMetadataId }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    lists: lists.messageLists.edges.map(({ node }) => node).sort((a, b) => a.name.localeCompare(b.name)),
  };
};
