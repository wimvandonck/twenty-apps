const pad = (value: number) => String(value).padStart(2, '0');

// An ISO date and time as the value of a datetime-local input, in the time
// zone of whoever is looking. Empty when it is not a date.
export const toLocalDateTime = (iso: string): string => {
  const date = new Date(iso);

  return Number.isNaN(date.getTime())
    ? ''
    : `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
