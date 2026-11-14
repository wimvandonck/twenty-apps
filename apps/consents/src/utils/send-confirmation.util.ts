import { sendBrevoEmail } from 'src/brevo-client/send-brevo-email';
import { fetchSubmissionConsents } from 'src/twenty-client/fetch-submission-consents';
import { type AppConfig } from 'src/types/app-config';
import { type PublicLocale } from 'src/types/public-messages';
import { type RecordStore } from 'src/types/record-store';
import { type SendResult } from 'src/types/send-result';
import { buildConfirmationUrl } from 'src/utils/build-confirmation-url.util';
import { personName } from 'src/utils/person-name.util';
import { renderConfirmationEmail } from 'src/utils/render-confirmation-email.util';

export type SendConfirmationInput = { personId: string; submissionId: string; locale: PublicLocale };

// Sends one confirmation mail for every consent of a submission that still
// waits for confirmation, and marks them sent. Without a Brevo key nothing is
// sent: a Twenty workflow can use the confirmation link on the consent instead.
export const sendConfirmation = async (
  store: RecordStore,
  config: AppConfig,
  input: SendConfirmationInput,
  now: number = Date.now(),
): Promise<SendResult> => {
  if (!config.brevoApiKey) {
    return { sent: false, retry: false, reason: 'no-sender' };
  }

  const pending = (await fetchSubmissionConsents(store, input.submissionId)).filter(
    (consent) => consent.status === 'PENDING' && consent.personId === input.personId,
  );

  if (pending.length === 0) {
    return { sent: false, retry: false, reason: 'nothing-pending' };
  }

  const person = await store.findOne('people', input.personId);
  const email = (person?.emails as { primaryEmail?: string } | undefined)?.primaryEmail ?? '';

  if (email === '') {
    return { sent: false, retry: false, reason: 'no-email' };
  }

  const emailTypes = await Promise.all(pending.map((consent) => store.findOne('emailTypes', consent.emailTypeId)));
  const { firstName, fullName } = personName(person);
  const content = renderConfirmationEmail({
    firstName,
    organizationName: config.organizationName,
    emailTypeNames: emailTypes.map((type) => (typeof type?.name === 'string' ? type.name : '')).filter(Boolean),
    confirmationUrl: buildConfirmationUrl(config.publicBaseUrl, input.submissionId, config.signingSecret, now),
    locale: input.locale,
  });
  const result = await sendBrevoEmail(
    { ...content, to: fullName ? { email, name: fullName } : { email } },
    { apiKey: config.brevoApiKey, senderEmail: config.senderEmail, senderName: config.senderName },
  );

  if (result.sent) {
    const sentAt = new Date(now).toISOString();

    await Promise.all(pending.map((consent) => store.update('consents', consent.id, { confirmationSentAt: sentAt })));
  }

  return result;
};
