// How two records of one submission are connected.
export type FormLink =
  | {
      // A relation field on the source record points at the target record.
      kind: 'DIRECT';
      sourceRecordKey: string;
      relationFieldName: string;
      joinColumnName: string;
      targetRecordKey: string;
    }
  | {
      // A junction record (e.g. a note target) points at both records.
      kind: 'JUNCTION';
      junctionObjectNamePlural: string;
      sourceRecordKey: string;
      sourceJoinColumnName: string;
      targetRecordKey: string;
      targetJoinColumnName: string;
    };
