import { type PreferenceData } from 'src/types/preference-data';
import { type PreferenceGroups } from 'src/types/preference-groups';

// Lists sit under the email type they need; a list whose email type is not
// shown (inactive or gone) is left out, since nobody can consent to it here.
export const buildPreferenceGroups = (data: PreferenceData): PreferenceGroups => ({
  consents: data.emailTypes.map((emailType) => {
    const isGranted = emailType.status === 'GRANTED';

    return {
      emailType,
      isGranted,
      lists: data.lists
        .filter((list) => list.requiredEmailTypeId === emailType.id)
        .map((list) => ({ ...list, isDisabled: !isGranted })),
    };
  }),
  otherLists: data.lists
    .filter((list) => list.requiredEmailTypeId === null)
    .map((list) => ({ ...list, isDisabled: false })),
});
