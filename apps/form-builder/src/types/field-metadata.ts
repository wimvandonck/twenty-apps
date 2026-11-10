export type FieldMetadata = {
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
};
