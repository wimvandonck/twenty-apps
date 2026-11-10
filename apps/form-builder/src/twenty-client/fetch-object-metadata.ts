import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { type ObjectMetadata } from 'src/types/object-metadata';

// The objects a form can target, with the field details the builder needs.
// System objects are left out; the form object itself is too.
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
          },
        },
      },
    },
  });

  return result.objects.edges
    .map(({ node }) => node)
    .filter(
      (node) =>
        node.isActive &&
        !node.isSystem &&
        !node.isRemote &&
        !node.isUIReadOnly &&
        node.nameSingular !== 'form',
    )
    .map((node) => ({
      nameSingular: node.nameSingular,
      namePlural: node.namePlural,
      labelSingular: node.labelSingular,
      labelPlural: node.labelPlural,
      fields: node.fieldsList.map((field) => ({
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
      })),
    }))
    .sort((a, b) => a.labelSingular.localeCompare(b.labelSingular));
};
