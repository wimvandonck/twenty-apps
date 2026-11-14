import { type AppConfig } from 'src/types/app-config';

const value = (raw: string | undefined) => (raw && raw.trim() !== '' ? raw.trim() : null);

// The app's settings from the environment Twenty gives a logic function.
export const readAppConfig = (env: Record<string, string | undefined> = process.env): AppConfig => {
  const signingSecret = value(env.CONSENT_SIGNING_SECRET);

  if (!signingSecret) {
    throw new Error('The CONSENT_SIGNING_SECRET setting of the Consents app is empty');
  }

  return {
    signingSecret,
    brevoApiKey: value(env.BREVO_API_KEY),
    senderEmail: value(env.SENDER_EMAIL) ?? '',
    senderName: value(env.SENDER_NAME) ?? value(env.ORGANIZATION_NAME) ?? '',
    organizationName: value(env.ORGANIZATION_NAME) ?? value(env.SENDER_NAME) ?? '',
    publicBaseUrl: (value(env.TWENTY_FUNCTIONS_URL) ?? value(env.TWENTY_API_URL) ?? '').replace(/\/+$/, ''),
  };
};

// The settings, or null while the signing secret is not set yet.
export const readAppConfigOrNull = (env: Record<string, string | undefined> = process.env): AppConfig | null => {
  try {
    return readAppConfig(env);
  } catch {
    return null;
  }
};
