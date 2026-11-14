// An amount in micros as money in the visitor's language, e.g. "€ 15,00".
export const formatMoney = (micros: number, currencyCode: string, locale: string): string => {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(micros / 1_000_000);
  } catch {
    return `${currencyCode} ${(micros / 1_000_000).toFixed(2)}`;
  }
};
