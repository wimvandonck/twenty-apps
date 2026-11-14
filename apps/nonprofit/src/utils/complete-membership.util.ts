import { type CurrencyValue } from 'src/types/currency-value';
import { computeMembershipEnd } from 'src/utils/compute-membership-end.util';

export type MembershipFields = {
  name: string;
  startsOn: string | null;
  endsOn: string | null;
  amount: CurrencyValue;
};

export type MembershipTypeFields = { name: string; price: CurrencyValue; duration: string } | null;

// The fields to fill on a new membership: a name from the member and type,
// today as start, the end from the type's duration and the type's price.
// Anything already filled in is kept.
export const completeMembership = (
  membership: MembershipFields,
  type: MembershipTypeFields,
  memberName: string,
  today: string,
): Partial<MembershipFields> => {
  const patch: Partial<MembershipFields> = {};
  const startsOn = membership.startsOn ?? today;

  if (!membership.name) {
    patch.name = [memberName, type?.name ?? ''].filter((part) => part !== '').join(' – ');
  }

  if (!membership.startsOn) {
    patch.startsOn = startsOn;
  }

  if (!membership.endsOn && type) {
    const endsOn = computeMembershipEnd(startsOn, type.duration);

    if (endsOn) {
      patch.endsOn = endsOn;
    }
  }

  if ((membership.amount?.amountMicros ?? null) === null && type?.price?.amountMicros != null) {
    patch.amount = type.price;
  }

  return patch;
};
