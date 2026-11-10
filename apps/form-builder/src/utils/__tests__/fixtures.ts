import { type FieldMetadata } from 'src/types/field-metadata';
import { type FormDefinition } from 'src/types/form-definition';
import { type ObjectMetadata } from 'src/types/object-metadata';

export const field = (overrides: Partial<FieldMetadata> & { name: string }): FieldMetadata => ({
  label: overrides.name,
  type: 'TEXT',
  isSystem: false,
  isActive: true,
  isNullable: true,
  isUnique: false,
  isUIReadOnly: false,
  defaultValue: null,
  options: null,
  joinColumnName: null,
  relationType: null,
  relationTargetObjectNameSingular: null,
  ...overrides,
});

export const PERSON: ObjectMetadata = {
  nameSingular: 'person',
  namePlural: 'people',
  labelSingular: 'Person',
  labelPlural: 'People',
  fields: [
    field({ name: 'id', type: 'UUID', isSystem: true, isNullable: false }),
    field({ name: 'name', type: 'FULL_NAME', label: 'Name' }),
    field({ name: 'emails', type: 'EMAILS', label: 'Emails', isUnique: true }),
    field({ name: 'nickname', label: 'Nickname', isNullable: false }),
    field({ name: 'searchVector', type: 'TS_VECTOR', isSystem: true }),
    field({
      name: 'company',
      type: 'RELATION',
      label: 'Company',
      relationType: 'MANY_TO_ONE',
      joinColumnName: 'companyId',
      relationTargetObjectNameSingular: 'company',
    }),
    field({ name: 'notes', type: 'RELATION', relationType: 'ONE_TO_MANY' }),
  ],
};

export const COMPANY: ObjectMetadata = {
  nameSingular: 'company',
  namePlural: 'companies',
  labelSingular: 'Company',
  labelPlural: 'Companies',
  fields: [field({ name: 'name', label: 'Name' })],
};

export const DEFINITION: FormDefinition = {
  version: 1,
  title: 'Contact us',
  description: '',
  submitLabel: 'Send',
  successMessage: 'Thanks!',
  records: [
    {
      key: 'person',
      objectNameSingular: 'person',
      objectNamePlural: 'people',
      label: 'Person',
      mode: 'UPSERT',
      matchFieldName: 'emails',
      fields: [
        { name: 'name', label: 'Name', type: 'FULL_NAME', required: false },
        { name: 'emails', label: 'Email', type: 'EMAILS', required: true },
      ],
    },
    {
      key: 'company',
      objectNameSingular: 'company',
      objectNamePlural: 'companies',
      label: 'Company',
      mode: 'CREATE',
      fields: [{ name: 'name', label: 'Company name', type: 'TEXT', required: true }],
    },
  ],
  links: [
    {
      sourceRecordKey: 'person',
      relationFieldName: 'company',
      joinColumnName: 'companyId',
      targetRecordKey: 'company',
    },
  ],
};
