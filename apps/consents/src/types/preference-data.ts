import { type ConsentStatus } from 'src/types/consent-status';

export type PreferenceEmailType = { id: string; name: string; description: string; status: ConsentStatus | null };

export type PreferenceList = { id: string; name: string; requiredEmailTypeId: string | null; isMember: boolean };

export type PreferenceData = {
  firstName: string;
  emailTypes: PreferenceEmailType[];
  lists: PreferenceList[];
};
