// The total of a submission and the payment it creates.
export type FormPayment = {
  // ISO currency of the total; choices and amounts in another currency are refused.
  currencyCode: string;
  // Currency fields the visitor fills in that count towards the total, such
  // as the amount of a donation.
  amountFields: Array<{ recordKey: string; fieldName: string }>;
  // Currency fields that receive the total, such as an order's total.
  totalFields: Array<{ recordKey: string; fieldName: string }>;
  // Whether a payment record is created when the total is above zero.
  createPayment: boolean;
  // The person record who pays.
  payerRecordKey: string | null;
  // Columns that point at the payment, on records of the submission or on
  // the lines of a picker.
  paymentLinks: Array<{ recordKey?: string; pickerKey?: string; joinColumnName: string }>;
};
