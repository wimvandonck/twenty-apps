import { type ConsentRecord } from 'src/types/consent-record';
import { type ConsentStatus } from 'src/types/consent-status';

// The fields to write so a consent gets a new status. A consent that becomes
// pending gets the new confirmation link and needs a new mail; any other
// status drops the link.
export const applyStatus = (
  current: ConsentRecord,
  status: ConsentStatus | null,
  now: string,
  confirmationUrl: string | null,
): Partial<Omit<ConsentRecord, 'id'>> => {
  const patch: Partial<Omit<ConsentRecord, 'id'>> = {};

  if (current.status !== status) {
    patch.status = status;

    if (status === 'GRANTED') {
      patch.grantedAt = now;
    }

    if (status === 'WITHDRAWN') {
      patch.withdrawnAt = now;
    }
  }

  const link = status === 'PENDING' ? confirmationUrl : null;

  if (link !== current.confirmationUrl && !(link === null && current.confirmationUrl === null)) {
    patch.confirmationUrl = link;

    if (status === 'PENDING') {
      patch.confirmationSentAt = null;
    }
  }

  return patch;
};
