export type EditorField = {
  name: string;
  label: string;
  type: string;
  options: Array<{ value: string; label: string }> | null;
  // For a many-to-one relation: the singular name of the object it points at.
  relationTarget: string | null;
};

export type EditorObject = {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  fields: EditorField[];
};

export type EditorView = { id: string; name: string; objectId: string };

export type EditorList = { id: string; name: string };

export type EditorMetadata = {
  objects: EditorObject[];
  views: EditorView[];
  lists: EditorList[];
};
