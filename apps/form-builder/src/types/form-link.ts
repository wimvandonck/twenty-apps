export type FormLink = {
  // The record holding the relation field (the "many" side).
  sourceRecordKey: string;
  relationFieldName: string;
  joinColumnName: string;
  targetRecordKey: string;
};
