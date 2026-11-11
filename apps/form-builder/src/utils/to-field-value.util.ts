import { CURRENCY_CODES } from 'src/constants/currency-codes';
import { type FormField } from 'src/types/form-field';
import { type PublicFormMessages } from 'src/types/public-form-messages';

const MAX_TEXT_LENGTH = 5000;
const EMAIL = /^[^\s@"]+@[^\s@"]+\.[^\s@"]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

type FieldValue =
  | { status: 'EMPTY' }
  | { status: 'INVALID'; reason: keyof PublicFormMessages }
  | { status: 'VALID'; value: unknown };

const asTrimmedText = (value: unknown): string =>
  typeof value === 'string' ? value.trim().slice(0, MAX_TEXT_LENGTH) : '';

const asParts = (value: unknown): Record<string, string> =>
  typeof value === 'object' && value !== null
    ? Object.fromEntries(
        Object.entries(value).map(([key, part]) => [key, asTrimmedText(part)]),
      )
    : {};

const EMPTY: FieldValue = { status: 'EMPTY' };
const valid = (value: unknown): FieldValue => ({ status: 'VALID', value });
const invalid = (reason: keyof PublicFormMessages): FieldValue => ({ status: 'INVALID', reason });

// Converts one posted value into the shape Twenty stores for the field type.
export const toFieldValue = (field: FormField, raw: unknown): FieldValue => {
  const text = asTrimmedText(raw);
  const optionValues = (field.options ?? []).map(({ value }) => value);

  switch (field.type) {
    case 'TEXT':
      return text === '' ? EMPTY : valid(text);
    case 'RICH_TEXT':
      return text === '' ? EMPTY : valid({ markdown: text });
    case 'NUMBER': {
      const number = Number(text);

      if (text === '') return EMPTY;

      return Number.isFinite(number) ? valid(number) : invalid('invalidNumber');
    }
    case 'BOOLEAN':
      // An unticked checkbox is empty, so a required one must be ticked.
      return raw === true ? valid(true) : EMPTY;
    case 'DATE':
      if (text === '') return EMPTY;

      return DATE.test(text) ? valid(text) : invalid('invalidDate');
    case 'DATE_TIME': {
      if (text === '') return EMPTY;

      const time = Date.parse(text);

      return Number.isNaN(time)
        ? invalid('invalidDateTime')
        : valid(new Date(time).toISOString());
    }
    case 'SELECT':
      if (text === '') return EMPTY;

      return optionValues.includes(text) ? valid(text) : invalid('invalidChoice');
    case 'MULTI_SELECT': {
      const values = Array.isArray(raw) ? raw.map(asTrimmedText) : [];

      if (values.length === 0) return EMPTY;

      return values.every((value) => optionValues.includes(value))
        ? valid(values)
        : invalid('invalidChoice');
    }
    case 'EMAILS':
      if (text === '') return EMPTY;

      return EMAIL.test(text)
        ? valid({ primaryEmail: text.toLowerCase() })
        : invalid('invalidEmail');
    case 'PHONES':
      return text === '' ? EMPTY : valid({ primaryPhoneNumber: text });
    case 'LINKS':
      return text === '' ? EMPTY : valid({ primaryLinkUrl: text, primaryLinkLabel: '' });
    case 'FULL_NAME': {
      const { firstName = '', lastName = '' } = asParts(raw);

      return firstName === '' && lastName === '' ? EMPTY : valid({ firstName, lastName });
    }
    case 'CURRENCY': {
      const { amount = '', currencyCode = '' } = asParts(raw);
      const number = Number(amount);

      if (amount === '') return EMPTY;
      if (!Number.isFinite(number)) return invalid('invalidNumber');
      if (!CURRENCY_CODES.includes(currencyCode)) return invalid('invalidCurrency');

      return valid({ amountMicros: Math.round(number * 1_000_000), currencyCode });
    }
    case 'PAGE_BREAK':
      return EMPTY;
    case 'ADDRESS': {
      const { street = '', city = '', postcode = '', country = '' } = asParts(raw);

      return [street, city, postcode, country].every((part) => part === '')
        ? EMPTY
        : valid({
            addressStreet1: street,
            addressCity: city,
            addressPostcode: postcode,
            addressCountry: country,
          });
    }
  }
};
