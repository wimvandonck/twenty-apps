import { signToken } from 'src/utils/sign-token.util';

export const buildPreferencesUrl = (baseUrl: string, personId: string, secret: string): string =>
  `${baseUrl}/s/consents/preferences?token=${signToken({ kind: 'preferences', personId }, secret)}`;
