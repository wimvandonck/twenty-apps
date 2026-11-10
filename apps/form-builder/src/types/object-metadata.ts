import { type FieldMetadata } from 'src/types/field-metadata';

export type ObjectMetadata = {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  // Whether a form may write records of this object. System objects are
  // loaded too, because junction objects are system objects.
  isSelectable: boolean;
  fields: FieldMetadata[];
};
