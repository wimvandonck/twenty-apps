export type FormFieldType =
  | 'TEXT'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'DATE'
  | 'DATE_TIME'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'EMAILS'
  | 'PHONES'
  | 'LINKS'
  | 'FULL_NAME'
  | 'CURRENCY'
  | 'ADDRESS'
  | 'RICH_TEXT'
  // A record that already exists, chosen from a list or fixed by a default.
  | 'RELATION'
  // Not a field of the object: starts a new step of the form.
  | 'PAGE_BREAK';
