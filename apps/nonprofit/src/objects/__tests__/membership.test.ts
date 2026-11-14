import { describe, expect, it } from 'vitest';

import membershipObject from 'src/objects/membership';
import membershipTypeObject from 'src/objects/membership-type';
import paymentObject from 'src/objects/payment';

type Fields = { config: { fields?: Array<{ name: string; options?: unknown }> } };

const names = (object: Fields) => (object.config.fields ?? []).map((field) => field.name);
const values = (object: Fields, name: string) =>
  ((object.config.fields ?? []).find((field) => field.name === name)?.options as Array<{ value: string }>).map(
    (option) => option.value,
  );

describe('membership data model', () => {
  it('defines membership types with a price and a duration', () => {
    expect(membershipTypeObject.config.nameSingular).toBe('membershipType');
    expect(names(membershipTypeObject)).toEqual(
      expect.arrayContaining(['name', 'price', 'duration', 'isAvailable', 'description', 'memberships']),
    );
    expect(values(membershipTypeObject, 'duration')).toEqual(['ONE_YEAR', 'CALENDAR_YEAR', 'ONE_MONTH', 'LIFETIME']);
  });

  it('defines memberships for a person or an organization, with a period and a payment', () => {
    expect(names(membershipObject)).toEqual(
      expect.arrayContaining(['name', 'status', 'startsOn', 'endsOn', 'amount', 'membershipType', 'member', 'company', 'payment']),
    );
    expect(values(membershipObject, 'status')).toEqual(['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED']);
  });

  it('lists the memberships a payment covers', () => {
    expect(names(paymentObject)).toContain('memberships');
  });
});
