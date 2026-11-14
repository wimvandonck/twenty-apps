// The Brevo contact attribute for an email type: CONSENT_ and the name in
// capitals, without accents or punctuation. "Nieuwsbrief" -> CONSENT_NIEUWSBRIEF.
export const consentAttributeName = (emailTypeName: string): string => {
  const slug = emailTypeName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return `CONSENT_${slug || 'EMAIL_TYPE'}`;
};
