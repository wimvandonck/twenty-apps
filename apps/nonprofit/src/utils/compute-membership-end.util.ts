import { type MembershipDuration } from 'src/types/membership-duration';

const pad = (value: number) => String(value).padStart(2, '0');

const lastDayOfMonth = (year: number, month: number) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

// The last day of a membership that starts on a date (YYYY-MM-DD): the day
// before the same date a month or a year later, 31 December for a calendar
// year, and null for a lifetime membership.
export const computeMembershipEnd = (startsOn: string, duration: MembershipDuration | string): string | null => {
  const [year, month, day] = startsOn.split('-').map(Number);

  if (duration === 'LIFETIME' || !year || !month || !day) {
    return null;
  }

  if (duration === 'CALENDAR_YEAR') {
    return `${year}-12-31`;
  }

  const months = duration === 'ONE_MONTH' ? 1 : 12;
  const targetMonthIndex = month - 1 + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const targetMonth = targetMonthIndex % 12;
  // The same day, or the month's last day when it is shorter.
  const sameDay = Math.min(day, lastDayOfMonth(targetYear, targetMonth));
  const end = new Date(Date.UTC(targetYear, targetMonth, sameDay));

  // A month or year that had to be cut short already ends on its last day.
  if (sameDay === day) {
    end.setUTCDate(end.getUTCDate() - 1);
  }

  return `${end.getUTCFullYear()}-${pad(end.getUTCMonth() + 1)}-${pad(end.getUTCDate())}`;
};
