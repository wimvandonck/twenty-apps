import { type ChangeSummary } from 'src/twenty-client/fetch-changes';
import { type AppConfig } from 'src/types/app-config';
import { buildConfirmationUrl } from 'src/utils/build-confirmation-url.util';

// The confirmation link for the latest request in a history. A request
// recorded without a submission is confirmed by its own id.
export const confirmationUrlFor = (changes: ChangeSummary[], config: AppConfig, now: number): string | null => {
  const request = [...changes].reverse().find((change) => change.action === 'REQUESTED');

  return request
    ? buildConfirmationUrl(config.publicBaseUrl, request.submissionId ?? request.id, config.signingSecret, now)
    : null;
};
