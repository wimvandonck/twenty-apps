import { type ConsentStatus } from 'src/types/consent-status';

export type ConsentRecord = {
  id: string;
  name: string;
  personId: string;
  emailTypeId: string;
  status: ConsentStatus | null;
  grantedAt: string | null;
  withdrawnAt: string | null;
  confirmationUrl: string | null;
  confirmationSentAt: string | null;
};
