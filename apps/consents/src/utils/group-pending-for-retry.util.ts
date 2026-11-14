import { CONFIRMATION_VALIDITY_MS } from 'src/constants/confirmation-validity';
import { type PendingConsent } from 'src/types/pending-consent';
import { type SendConfirmationInput } from 'src/utils/send-confirmation.util';
import { getPublicMessages } from 'src/utils/get-public-messages.util';

// One retry per submission whose confirmation mail has not gone out and
// whose link would still work.
export const groupPendingForRetry = (pending: PendingConsent[], now: number): SendConfirmationInput[] => {
  const groups = new Map<string, SendConfirmationInput>();

  for (const consent of pending) {
    const requestedAt = consent.requestedAt ? Date.parse(consent.requestedAt) : Number.NaN;

    if (!consent.submissionId || !consent.email || Number.isNaN(requestedAt)) {
      continue;
    }

    if (requestedAt + CONFIRMATION_VALIDITY_MS < now || groups.has(consent.submissionId)) {
      continue;
    }

    groups.set(consent.submissionId, {
      personId: consent.personId,
      submissionId: consent.submissionId,
      locale: getPublicMessages(consent.language, undefined).locale,
    });
  }

  return [...groups.values()];
};
