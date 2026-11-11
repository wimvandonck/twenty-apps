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
  // Not a field of the object: starts a new step of the form.
  | 'PAGE_BREAK';
