import { fetchLatestChange } from 'src/twenty-client/fetch-latest-change';
import { type PendingConsent } from 'src/types/pending-consent';
import { type RecordStore } from 'src/types/record-store';
import { personName } from 'src/utils/person-name.util';
import { toConsentRecord } from 'src/utils/to-consent-record.util';

// Pending consents whose confirmation mail has not gone out yet, newest
// first, so old requests that can no longer be sent never crowd out new ones.
export const fetchPendingConsents = async (store: RecordStore): Promise<PendingConsent[]> => {
  const consents = (
    await store.find(
      'consents',
      { status: 'PENDING', confirmationSentAt: null },
      { orderBy: { field: 'createdAt', direction: 'desc' }, limit: 100 },
    )
  ).map(toConsentRecord);

  return Promise.all(
    consents.map(async (consent) => {
      const [latest, person, emailType] = await Promise.all([
        fetchLatestChange(store, consent.id),
        store.findOne('people', consent.personId),
        store.findOne('emailTypes', consent.emailTypeId),
      ]);
      const email = (person?.emails as { primaryEmail?: string } | undefined)?.primaryEmail;

      return {
        ...consent,
        submissionId: latest?.action === 'REQUESTED' ? (latest.submissionId ?? latest.id) : null,
        language: latest?.language ?? null,
        requestedAt: latest?.occurredAt ?? null,
        email: email && email !== '' ? email : null,
        firstName: personName(person).firstName,
        emailTypeName: typeof emailType?.name === 'string' ? emailType.name : '',
      };
    }),
  );
};
