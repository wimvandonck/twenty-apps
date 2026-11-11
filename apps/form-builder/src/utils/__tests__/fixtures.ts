import { type FieldMetadata } from 'src/types/field-metadata';
import { type FormDefinition } from 'src/types/form-definition';
import { type ObjectMetadata } from 'src/types/object-metadata';

export const field = (overrides: Partial<FieldMetadata> & { name: string }): FieldMetadata => ({
  id: `id-${overrides.name}`,
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
  junctionTargetFieldId: null,
  morphTargetObjectNamesSingular: [],
  ...overrides,
});

export const PERSON: ObjectMetadata = {
  nameSingular: 'person',
  namePlural: 'people',
  labelSingular: 'Person',
  labelPlural: 'People',
  isSelectable: true,
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
  isSelectable: true,
  fields: [field({ name: 'name', label: 'Name' })],
};

export const NOTE: ObjectMetadata = {
  nameSingular: 'note',
  namePlural: 'notes',
  labelSingular: 'Note',
  labelPlural: 'Notes',
  isSelectable: true,
  fields: [
    field({ name: 'title', label: 'Title' }),
    field({
      name: 'noteTargets',
      type: 'RELATION',
      relationType: 'ONE_TO_MANY',
      relationTargetObjectNameSingular: 'noteTarget',
      junctionTargetFieldId: 'note-target-target',
    }),
  ],
};

export const NOTE_TARGET: ObjectMetadata = {
  nameSingular: 'noteTarget',
  namePlural: 'noteTargets',
  labelSingular: 'Note target',
  labelPlural: 'Note targets',
  isSelectable: false,
  fields: [
    field({
      name: 'note',
      type: 'RELATION',
      relationType: 'MANY_TO_ONE',
      joinColumnName: 'noteId',
      relationTargetObjectNameSingular: 'note',
    }),
    field({
      id: 'note-target-target',
      name: 'target',
      type: 'MORPH_RELATION',
      morphTargetObjectNamesSingular: ['person', 'company'],
    }),
  ],
};

export const NOTE_RECORD = {
  key: 'note',
  objectNameSingular: 'note',
  objectNamePlural: 'notes',
  label: 'Note',
  mode: 'CREATE' as const,
  fields: [{ name: 'title', label: 'Title', type: 'TEXT' as const, required: false }],
};

export const NOTE_LINK = {
  kind: 'JUNCTION' as const,
  junctionObjectNamePlural: 'noteTargets',
  sourceRecordKey: 'note',
  sourceJoinColumnName: 'noteId',
  targetRecordKey: 'person',
  targetJoinColumnName: 'targetPersonId',
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
      kind: 'DIRECT',
      sourceRecordKey: 'person',
      relationFieldName: 'company',
      joinColumnName: 'companyId',
      targetRecordKey: 'company',
    },
  ],
  lists: [],
};

export const NEWSLETTER = {
  key: 'list1',
  listId: 'c620b0f5-c8a5-4432-8e91-c3cd938e7100',
  listName: 'Newsletter',
  recordKey: 'person',
  optIn: false,
  label: 'Subscribe to Newsletter',
  checked: false,
};
