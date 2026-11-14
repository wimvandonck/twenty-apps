import { type ConsentChangeInput } from 'src/types/consent-change-input';

export type ChangeRequest = {
  personId: string;
  changes: Array<{ emailTypeId: string } & Omit<ConsentChangeInput, 'submissionId' | 'ipAddress' | 'userAgent'>>;
};
