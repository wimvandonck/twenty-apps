import PUBLIC_FORM_MESSAGES from 'src/constants/public-form-messages.json';
import { type PublicFormMessages } from 'src/types/public-form-messages';

const CATALOGS: Record<string, Partial<PublicFormMessages>> = PUBLIC_FORM_MESSAGES;

// Picks the catalog for the first language the visitor asks for that the app
// has, e.g. from "nl-BE,nl;q=0.9,en;q=0.8". An explicit language wins over
// the browser's. English fills any gap.
export const getPublicFormMessages = (
  explicitLanguage: string | undefined,
  acceptLanguage: string | undefined,
): { locale: string; messages: PublicFormMessages } => {
  const requested = [explicitLanguage ?? '', ...(acceptLanguage ?? '').split(',')]
    .map((entry) => entry.split(';')[0].trim().toLowerCase())
    .filter((entry) => /^[a-z]{2,3}(-[a-z0-9]+)*$/.test(entry));
  const locales = Object.keys(CATALOGS);
  const locale =
    requested
      .map(
        (entry) =>
          locales.find((candidate) => candidate.toLowerCase() === entry) ??
          locales.find((candidate) => candidate.toLowerCase().split('-')[0] === entry.split('-')[0]),
      )
      .find((match) => match !== undefined) ?? 'en';

  return {
    locale,
    messages: { ...(CATALOGS.en as PublicFormMessages), ...CATALOGS[locale] },
  };
};
