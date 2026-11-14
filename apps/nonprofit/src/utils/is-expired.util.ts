// Whether a membership that ends on a date (YYYY-MM-DD) has expired today.
export const isExpired = (endsOn: string | null, today: string): boolean => endsOn !== null && endsOn < today;
