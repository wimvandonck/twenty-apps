export type FieldMetadata = {
  id: string;
  name: string;
  label: string;
  type: string;
  isSystem: boolean;
  isActive: boolean;
  isNullable: boolean;
  isUnique: boolean;
  isUIReadOnly: boolean;
  defaultValue: unknown;
  options: Array<{ value: string; label: string }> | null;
  joinColumnName: string | null;
  relationType: string | null;
  relationTargetObjectNameSingular: string | null;
  // On a one-to-many field: the junction object's field that points at the
  // records on the other side.
  junctionTargetFieldId: string | null;
  // On a morph relation: every object it can point at.
  morphTargetObjectNamesSingular: string[];
};
