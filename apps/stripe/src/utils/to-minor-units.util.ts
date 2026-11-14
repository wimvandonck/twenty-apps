// Currencies Stripe counts in whole units.
const ZERO_DECIMAL = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'];

// Twenty stores amounts in micros; Stripe wants the smallest currency unit.
export const toMinorUnits = (amountMicros: number, currencyCode: string): number =>
  Math.round(amountMicros / (ZERO_DECIMAL.includes(currencyCode.toUpperCase()) ? 1_000_000 : 10_000));
