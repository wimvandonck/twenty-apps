import PUBLIC_MESSAGES from 'src/constants/public-messages.json';
import { type PublicLocale, type PublicMessages } from 'src/types/public-messages';

const LOCALES = Object.keys(PUBLIC_MESSAGES) as PublicLocale[];

// The texts for the first language asked for that the app has, from an
// explicit language and then the browser's ("nl-BE,nl;q=0.9"). English otherwise.
export const getPublicMessages = (
  explicitLanguage: string | null | undefined,
  acceptLanguage: string | null | undefined,
): { locale: PublicLocale; messages: PublicMessages } => {
  const requested = [explicitLanguage ?? '', ...(acceptLanguage ?? '').split(',')]
    .map((entry) => entry.split(';')[0].trim().toLowerCase().split('-')[0])
    .filter((entry) => entry !== '');
  const locale = requested.map((entry) => LOCALES.find((candidate) => candidate === entry)).find(Boolean) ?? 'en';

  return { locale, messages: PUBLIC_MESSAGES[locale] };
};
