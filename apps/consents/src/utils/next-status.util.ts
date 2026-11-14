import { type ConsentAction } from 'src/types/consent-action';
import { type ConsentStatus } from 'src/types/consent-status';

// The status a consent gets after a change. A new request never takes away a
// consent that was already granted.
export const nextStatus = (current: ConsentStatus | null, action: ConsentAction): ConsentStatus => {
  switch (action) {
    case 'REQUESTED':
      return current === 'GRANTED' ? 'GRANTED' : 'PENDING';
    case 'CONFIRMED':
    case 'GRANTED':
      return 'GRANTED';
    case 'WITHDRAWN':
      return 'WITHDRAWN';
  }
};
