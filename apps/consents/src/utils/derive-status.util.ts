import { type ConsentAction } from 'src/types/consent-action';
import { type ConsentStatus } from 'src/types/consent-status';
import { nextStatus } from 'src/utils/next-status.util';

// The status a history of changes leads to, oldest first. The history is the
// proof; the status on the consent must always equal this.
export const deriveStatus = (actions: ConsentAction[]): ConsentStatus | null =>
  actions.reduce<ConsentStatus | null>((status, action) => nextStatus(status, action), null);
