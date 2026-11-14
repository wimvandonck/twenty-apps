export type ContactInput = {
  email: string;
  firstName: string;
  lastName: string;
  // Consent attribute -> whether the person has consent.
  consents: Record<string, boolean>;
  listIds: number[];
};

export type ContactUpsert = {
  email: string;
  attributes: Record<string, string | boolean>;
  listIds?: number[];
  updateEnabled: true;
};
