import { type ConsentRecord } from 'src/types/consent-record';
import { type ConsentStatus } from 'src/types/consent-status';
import { type StoredRecord } from 'src/types/record-store';

const text = (value: unknown): string | null => (typeof value === 'string' && value !== '' ? value : null);

export const toConsentRecord = (record: StoredRecord): ConsentRecord => ({
  id: record.id,
  name: text(record.name) ?? '',
  personId: text(record.personId) ?? '',
  emailTypeId: text(record.emailTypeId) ?? '',
  status: (text(record.status) as ConsentStatus | null) ?? null,
  grantedAt: text(record.grantedAt),
  withdrawnAt: text(record.withdrawnAt),
  confirmationUrl: text(record.confirmationUrl),
  confirmationSentAt: text(record.confirmationSentAt),
});
