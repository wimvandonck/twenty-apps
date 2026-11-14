import { type ConsentRecord } from 'src/types/consent-record';

// A pending consent whose confirmation mail has not gone out, with what the
// mail needs.
export type PendingConsent = ConsentRecord & {
  submissionId: string | null;
  language: string | null;
  requestedAt: string | null;
  email: string | null;
  firstName: string;
  emailTypeName: string;
};
