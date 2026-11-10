import { type FieldMetadata } from 'src/types/field-metadata';

export type ObjectMetadata = {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  fields: FieldMetadata[];
};
