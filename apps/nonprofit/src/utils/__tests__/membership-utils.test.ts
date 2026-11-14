import { describe, expect, it } from 'vitest';

import { completeMembership } from 'src/utils/complete-membership.util';
import { computeMembershipEnd } from 'src/utils/compute-membership-end.util';
import { isExpired } from 'src/utils/is-expired.util';

describe('computeMembershipEnd', () => {
  it('ends the day before the same date a year or a month later', () => {
    expect(computeMembershipEnd('2027-03-15', 'ONE_YEAR')).toBe('2028-03-14');
    expect(computeMembershipEnd('2027-01-31', 'ONE_MONTH')).toBe('2027-02-28');
    expect(computeMembershipEnd('2028-02-29', 'ONE_YEAR')).toBe('2029-02-28');
  });

  it('ends a calendar year on 31 December and a lifetime never', () => {
    expect(computeMembershipEnd('2027-03-15', 'CALENDAR_YEAR')).toBe('2027-12-31');
    expect(computeMembershipEnd('2027-03-15', 'LIFETIME')).toBeNull();
  });
});

describe('completeMembership', () => {
  const type = { name: 'Gezin', price: { amountMicros: 35_000_000, currencyCode: 'EUR' }, duration: 'ONE_YEAR' };

  it('fills what is missing from the type and the member', () => {
    expect(
      completeMembership({ name: '', startsOn: null, endsOn: null, amount: { amountMicros: null, currencyCode: 'EUR' } }, type, 'Ann Peeters', '2027-03-15'),
    ).toEqual({
      name: 'Ann Peeters – Gezin',
      startsOn: '2027-03-15',
      endsOn: '2028-03-14',
      amount: { amountMicros: 35_000_000, currencyCode: 'EUR' },
    });
  });

  it('keeps what was filled in', () => {
    expect(
      completeMembership(
        { name: 'Eigen naam', startsOn: '2027-01-01', endsOn: '2027-06-30', amount: { amountMicros: 10_000_000, currencyCode: 'EUR' } },
        type,
        'Ann',
        '2027-03-15',
      ),
    ).toEqual({});
  });

  it('works without a type', () => {
    expect(completeMembership({ name: '', startsOn: null, endsOn: null, amount: null }, null, 'Ann', '2027-03-15')).toEqual({
      name: 'Ann',
      startsOn: '2027-03-15',
    });
  });
});

describe('isExpired', () => {
  it('expires the day after the end date', () => {
    expect(isExpired('2027-03-14', '2027-03-14')).toBe(false);
    expect(isExpired('2027-03-14', '2027-03-15')).toBe(true);
    expect(isExpired(null, '2099-01-01')).toBe(false);
  });
});
