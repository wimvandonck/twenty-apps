import { type StoredRecord } from 'src/types/record-store';

// The first and full name of a person record.
export const personName = (person: StoredRecord | null): { firstName: string; fullName: string } => {
  const name = (person?.name ?? {}) as { firstName?: string; lastName?: string };
  const firstName = name.firstName?.trim() ?? '';
  const fullName = [firstName, name.lastName?.trim() ?? ''].filter((part) => part !== '').join(' ');

  return { firstName, fullName };
};
