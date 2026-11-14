// A box that asks the person of a submission for consent to an email type
// of the Consents app. Consent is always opt-in: the box starts unticked.
export type FormConsent = {
  // Unique within the form, e.g. "consent1".
  key: string;
  emailTypeId: string;
  // The email type's name when it was chosen, shown if the type is gone.
  emailTypeName: string;
  // The form's person record the consent is for.
  recordKey: string;
  // The text next to the box, kept with the consent as proof.
  label: string;
  // Whether the form can only be sent with the box ticked.
  required: boolean;
};
