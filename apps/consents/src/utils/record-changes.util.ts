import { randomUUID } from 'node:crypto';

import { createConsentChange } from 'src/twenty-client/create-consent-change';
import { fetchChanges } from 'src/twenty-client/fetch-changes';
import { findOrCreateConsent } from 'src/twenty-client/find-or-create-consent';
import { updateConsent } from 'src/twenty-client/update-consent';
import { type AppConfig } from 'src/types/app-config';
import { type ChangeRequest } from 'src/types/change-request';
import { type ConsentStatus } from 'src/types/consent-status';
import { type RecordStore } from 'src/types/record-store';
import { type RequestContext } from 'src/types/request-context';
import { type SendResult } from 'src/types/send-result';
import { applyStatus } from 'src/utils/apply-status.util';
import { buildConfirmationUrl } from 'src/utils/build-confirmation-url.util';
import { deriveStatus } from 'src/utils/derive-status.util';
import { getPublicMessages } from 'src/utils/get-public-messages.util';
import { sendConfirmation } from 'src/utils/send-confirmation.util';

export type RecordChangesResult = {
  consents: Array<{ emailTypeId: string; status: ConsentStatus | null }>;
  // The confirmation mail, or null when nothing waits for confirmation.
  confirmation: SendResult | null;
};

// Records the changes of one request: each becomes a change on the person's
// consent for that email type, and the consent takes the status its history
// leads to. Requests share one submission, confirmed by one mail.
export const recordChanges = async (
  store: RecordStore,
  config: AppConfig,
  request: ChangeRequest,
  context: RequestContext,
  now: number = Date.now(),
): Promise<RecordChangesResult> => {
  const submissionId = randomUUID();
  const nowIso = new Date(now).toISOString();
  const confirmationUrl = buildConfirmationUrl(config.publicBaseUrl, submissionId, config.signingSecret, now);
  const consents: RecordChangesResult['consents'] = [];
  let needsConfirmation = false;

  for (const change of request.changes) {
    const { emailTypeId, ...input } = change;
    const consent = await findOrCreateConsent(store, request.personId, emailTypeId);

    await createConsentChange(store, consent.id, {
      ...input,
      occurredAt: input.occurredAt ?? nowIso,
      ...(input.action === 'REQUESTED' ? { submissionId } : {}),
      ...(context.ipAddress ? { ipAddress: context.ipAddress } : {}),
      ...(context.userAgent ? { userAgent: context.userAgent } : {}),
    });

    const status = deriveStatus((await fetchChanges(store, consent.id)).map((entry) => entry.action));

    await updateConsent(store, consent.id, applyStatus(consent, status, nowIso, confirmationUrl));
    consents.push({ emailTypeId, status });
    needsConfirmation ||= input.action === 'REQUESTED' && status === 'PENDING';
  }

  const language = request.changes.find((change) => change.language)?.language;
  const confirmation = needsConfirmation
    ? await sendConfirmation(
        store,
        config,
        { personId: request.personId, submissionId, locale: getPublicMessages(language, undefined).locale },
        now,
      )
    : null;

  return { consents, confirmation };
};
