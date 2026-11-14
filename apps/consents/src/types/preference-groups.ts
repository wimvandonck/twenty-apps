import { type PreferenceEmailType, type PreferenceList } from 'src/types/preference-data';

export type PreferenceGroupList = PreferenceList & { isDisabled: boolean };

export type PreferenceGroups = {
  consents: Array<{ emailType: PreferenceEmailType; isGranted: boolean; lists: PreferenceGroupList[] }>;
  otherLists: PreferenceGroupList[];
};
