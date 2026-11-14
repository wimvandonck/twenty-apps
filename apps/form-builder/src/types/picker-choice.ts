// One record a picker offers, as loaded when the form is shown or sent.
export type PickerChoice = {
  id: string;
  label: string;
  // Price of one unit in micros, or null when free.
  priceMicros: number | null;
  currencyCode: string | null;
  // The record's own fields, for columns copied to the line.
  record: Record<string, unknown>;
};
