import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { type ObjectMetadata } from 'src/types/object-metadata';

// Every active object with the field details the builder needs. Only
// non-system objects are selectable; the rest are there for junction links.
export const fetchObjectMetadata = async (): Promise<ObjectMetadata[]> => {
  const result = await new MetadataApiClient().query({
    objects: {
      __args: { filter: {}, paging: { first: 500 } },
      edges: {
        node: {
          nameSingular: true,
          namePlural: true,
          labelSingular: true,
          labelPlural: true,
          isSystem: true,
          isActive: true,
          isRemote: true,
          isUIReadOnly: true,
          fieldsList: {
            id: true,
            name: true,
            label: true,
            type: true,
            isSystem: true,
            isActive: true,
            isNullable: true,
            isUnique: true,
            isUIReadOnly: true,
            defaultValue: true,
            options: true,
            settings: true,
            relation: {
              type: true,
              targetObjectMetadata: { nameSingular: true },
            },
            morphRelations: {
              targetObjectMetadata: { nameSingular: true },
            },
          },
        },
      },
    },
  });

  return result.objects.edges
    .map(({ node }) => node)
    .filter((node) => node.isActive && !node.isRemote)
    .map((node) => ({
      nameSingular: node.nameSingular,
      namePlural: node.namePlural,
      labelSingular: node.labelSingular,
      labelPlural: node.labelPlural,
      isSelectable:
        !node.isSystem && !node.isUIReadOnly && node.nameSingular !== 'form',
      fields: node.fieldsList.map((field) => ({
        id: field.id ?? '',
        name: field.name,
        label: field.label,
        type: field.type,
        isSystem: field.isSystem === true,
        isActive: field.isActive === true,
        isNullable: field.isNullable !== false,
        isUnique: field.isUnique === true,
        isUIReadOnly: field.isUIReadOnly === true,
        defaultValue: field.defaultValue ?? null,
        options: Array.isArray(field.options) ? field.options : null,
        joinColumnName:
          typeof field.settings?.joinColumnName === 'string'
            ? field.settings.joinColumnName
            : null,
        relationType: field.relation?.type ?? null,
        relationTargetObjectNameSingular:
          field.relation?.targetObjectMetadata.nameSingular ?? null,
        junctionTargetFieldId:
          typeof field.settings?.junctionTargetFieldId === 'string'
            ? field.settings.junctionTargetFieldId
            : null,
        morphTargetObjectNamesSingular: (field.morphRelations ?? []).map(
          (relation) => relation.targetObjectMetadata.nameSingular,
        ),
      })),
    }))
    .sort((a, b) => a.labelSingular.localeCompare(b.labelSingular));
};
