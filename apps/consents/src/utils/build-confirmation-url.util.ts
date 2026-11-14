import { CONFIRMATION_VALIDITY_MS } from 'src/constants/confirmation-validity';
import { signToken } from 'src/utils/sign-token.util';

export const buildConfirmationUrl = (baseUrl: string, submissionId: string, secret: string, now: number): string =>
  `${baseUrl}/s/consents/confirm?token=${signToken(
    { kind: 'confirm', submissionId, expiresAt: now + CONFIRMATION_VALIDITY_MS },
    secret,
  )}`;
