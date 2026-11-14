// Today's date (YYYY-MM-DD) in Belgium, where the organizations work.
export const today = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(now);
