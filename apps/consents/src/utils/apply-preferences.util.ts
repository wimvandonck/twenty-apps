import { type PreferenceData } from 'src/types/preference-data';
import { buildPreferenceGroups } from 'src/utils/build-preference-groups.util';

export type PostedPreferences = { grantedEmailTypeIds: string[]; memberListIds: string[] };

export type PreferenceUpdate = {
  changes: Array<{ emailTypeId: string; action: 'GRANTED' | 'WITHDRAWN' }>;
  memberships: Array<{ listId: string; isMember: boolean }>;
};

// What differs between the page as posted and the person's current choices.
// A list under an email type that ends up without consent keeps its
// membership, so the choice comes back when consent is given again.
export const applyPreferences = (data: PreferenceData, posted: PostedPreferences): PreferenceUpdate => {
  const granted = new Set(posted.grantedEmailTypeIds);
  const members = new Set(posted.memberListIds);
  const groups = buildPreferenceGroups(data);
  const changes: PreferenceUpdate['changes'] = [];
  const memberships: PreferenceUpdate['memberships'] = [];

  for (const group of groups.consents) {
    const wantsConsent = granted.has(group.emailType.id);

    if (wantsConsent !== group.isGranted) {
      changes.push({ emailTypeId: group.emailType.id, action: wantsConsent ? 'GRANTED' : 'WITHDRAWN' });
    }

    if (!wantsConsent) {
      continue;
    }

    for (const list of group.lists) {
      if (members.has(list.id) !== list.isMember) {
        memberships.push({ listId: list.id, isMember: members.has(list.id) });
      }
    }
  }

  for (const list of groups.otherLists) {
    if (members.has(list.id) !== list.isMember) {
      memberships.push({ listId: list.id, isMember: members.has(list.id) });
    }
  }

  return { changes, memberships };
};
