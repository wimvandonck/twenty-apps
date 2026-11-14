import { fetchPreferenceData } from 'src/twenty-client/fetch-preference-data';
import { setListMembership } from 'src/twenty-client/set-list-membership';
import { type AppConfig } from 'src/types/app-config';
import { type PreferenceData } from 'src/types/preference-data';
import { type RecordStore } from 'src/types/record-store';
import { type RequestContext } from 'src/types/request-context';
import { applyPreferences } from 'src/utils/apply-preferences.util';
import { type PostedForm } from 'src/utils/parse-posted-form.util';
import { recordChanges } from 'src/utils/record-changes.util';
import { verifyToken } from 'src/utils/verify-token.util';

export type SavePreferencesResult = { ok: true; personId: string; data: PreferenceData } | { ok: false };

// Stores what a person chose on the preferences page. Consent given here
// counts at once: opening the personal link proves access to the mailbox.
export const savePreferences = async (
  store: RecordStore,
  config: AppConfig,
  posted: PostedForm,
  context: RequestContext,
  now: number = Date.now(),
): Promise<SavePreferencesResult> => {
  const payload = verifyToken(posted.token, config.signingSecret, now);

  if (payload?.kind !== 'preferences') {
    return { ok: false };
  }

  const before = await fetchPreferenceData(store, payload.personId);

  if (!before) {
    return { ok: false };
  }

  const update = applyPreferences(before, { grantedEmailTypeIds: posted.consent, memberListIds: posted.list });

  if (update.changes.length > 0) {
    await recordChanges(
      store,
      config,
      {
        personId: payload.personId,
        changes: update.changes.map((change) => ({ ...change, source: 'PREFERENCE_PAGE' as const })),
      },
      context,
      now,
    );
  }

  for (const membership of update.memberships) {
    await setListMembership(store, membership.listId, payload.personId, membership.isMember);
  }

  const after = await fetchPreferenceData(store, payload.personId);

  return after ? { ok: true, personId: payload.personId, data: after } : { ok: false };
};
