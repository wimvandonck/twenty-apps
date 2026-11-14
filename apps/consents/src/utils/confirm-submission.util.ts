import { createConsentChange } from 'src/twenty-client/create-consent-change';
import { fetchSubmissionConsents } from 'src/twenty-client/fetch-submission-consents';
import { type AppConfig } from 'src/types/app-config';
import { type RecordStore } from 'src/types/record-store';
import { type RequestContext } from 'src/types/request-context';
import { reconcileConsent } from 'src/utils/reconcile-consent.util';
import { verifyToken } from 'src/utils/verify-token.util';

export type ConfirmResult = { ok: true; personId: string; emailTypeNames: string[] } | { ok: false };

// Confirms the consents of a submission that still wait for it. A second
// click confirms nothing new and shows the same result.
export const confirmSubmission = async (
  store: RecordStore,
  config: AppConfig,
  token: string,
  context: RequestContext,
  now: number = Date.now(),
): Promise<ConfirmResult> => {
  const payload = verifyToken(token, config.signingSecret, now);

  if (payload?.kind !== 'confirm') {
    return { ok: false };
  }

  const consents = await fetchSubmissionConsents(store, payload.submissionId);

  if (consents.length === 0) {
    return { ok: false };
  }

  for (const consent of consents.filter((candidate) => candidate.status === 'PENDING')) {
    await createConsentChange(store, consent.id, {
      action: 'CONFIRMED',
      source: 'FORM',
      occurredAt: new Date(now).toISOString(),
      submissionId: payload.submissionId,
      ...context,
    });
    await reconcileConsent(store, config, consent.id, now);
  }

  const granted = (await fetchSubmissionConsents(store, payload.submissionId)).filter(
    (consent) => consent.status === 'GRANTED',
  );
  const emailTypes = await Promise.all(granted.map((consent) => store.findOne('emailTypes', consent.emailTypeId)));

  return {
    ok: true,
    personId: consents[0].personId,
    emailTypeNames: emailTypes.map((type) => (typeof type?.name === 'string' ? type.name : '')).filter(Boolean),
  };
};
