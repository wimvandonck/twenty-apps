export type ConsentChangeRequest = {
  emailTypeId: string;
  action: 'REQUESTED';
  source: 'FORM';
  shownText: string;
  formName?: string;
  language?: string;
};

export type ConsentRecordRequest = {
  personId: string;
  changes: ConsentChangeRequest[];
  ipAddress?: string;
  userAgent?: string;
};

// Records consents through the Consents app, so the flow can be tested
// without it.
export type ConsentApi = {
  record: (request: ConsentRecordRequest) => Promise<void>;
};
