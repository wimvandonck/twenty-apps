// A list of existing records to choose from with a quantity, such as
// products or ticket types. Every chosen unit or line becomes a record.
export type FormPicker = {
  // Unique within the form, e.g. "picker1".
  key: string;
  // The heading above the list on the form.
  label: string;
  // Whether the visitor must choose at least one.
  required: boolean;
  // One choice only, without a quantity, such as a membership type.
  single: boolean;
  // The most of one choice a visitor can take.
  maxQuantity: number;
  source: {
    objectNamePlural: string;
    // The currency field with the price of one unit; empty for free choices.
    priceFieldName: string | null;
    // Only records whose fields equal these values are offered, such as
    // isAvailable = true or organizedEventId = one event.
    filters: Array<{ fieldName: string; value: string | boolean }>;
  };
  line: {
    objectNamePlural: string;
    // The column on the line that points at the chosen record.
    sourceJoinColumnName: string;
    // A number field for the quantity. Without one, every unit is its own
    // record, as with registrations.
    quantityFieldName: string | null;
    // Currency fields for the price of one unit and of the whole line.
    unitPriceFieldName: string | null;
    lineTotalFieldName: string | null;
    // Columns on the line that point at records of the submission, such as
    // the order or the attendee.
    links: Array<{ joinColumnName: string; recordKey: string }>;
    // Columns copied from the chosen record to the line, such as the event
    // of a ticket type to the registration.
    copies: Array<{ sourceJoinColumnName: string; lineJoinColumnName: string }>;
  };
};
