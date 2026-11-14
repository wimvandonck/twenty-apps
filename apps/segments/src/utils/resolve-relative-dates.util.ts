const TOKEN = /^@(now|today)(?:([+-])(\d+)([dwMy]))?$/;

// Turns "@today-12M" into a date and "@now-7d" into a date and time,
// relative to now. Other values are returned unchanged.
export const resolveRelativeDate = (value: string, now: Date): string => {
  const match = TOKEN.exec(value);

  if (!match) {
    return value;
  }

  const [, anchor, sign, amountText, unit] = match;
  const date = new Date(now.getTime());

  if (sign) {
    const amount = Number(amountText) * (sign === '-' ? -1 : 1);

    if (unit === 'd') date.setUTCDate(date.getUTCDate() + amount);
    if (unit === 'w') date.setUTCDate(date.getUTCDate() + amount * 7);
    if (unit === 'M') date.setUTCMonth(date.getUTCMonth() + amount);
    if (unit === 'y') date.setUTCFullYear(date.getUTCFullYear() + amount);
  }

  return anchor === 'today' ? date.toISOString().slice(0, 10) : date.toISOString();
};

// Resolves every relative date in a filter, however deeply nested.
export const resolveRelativeDates = <T>(value: T, now: Date): T => {
  if (typeof value === 'string') {
    return resolveRelativeDate(value, now) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveRelativeDates(item, now)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveRelativeDates(item, now)]),
    ) as T;
  }

  return value;
};
