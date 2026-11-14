import { type ContactInput, type ContactUpsert } from 'src/types/contact-input';

// The body of Brevo's create-contact call that also updates an existing contact.
export const buildContactUpsert = (input: ContactInput): ContactUpsert => ({
  email: input.email.trim().toLowerCase(),
  attributes: {
    ...(input.firstName ? { FIRSTNAME: input.firstName } : {}),
    ...(input.lastName ? { LASTNAME: input.lastName } : {}),
    ...input.consents,
  },
  ...(input.listIds.length > 0 ? { listIds: input.listIds } : {}),
  updateEnabled: true,
});
