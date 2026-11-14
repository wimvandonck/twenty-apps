// The email and Brevo lists of an unsubscribe webhook event, or null for any
// other event.
export const parseUnsubscribe = (body: unknown): { email: string; listIds: number[] } | null => {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  const event = body as { event?: unknown; email?: unknown; list_id?: unknown };

  if (event.event !== 'unsubscribe' || typeof event.email !== 'string' || event.email.trim() === '') {
    return null;
  }

  return {
    email: event.email.trim().toLowerCase(),
    listIds: Array.isArray(event.list_id) ? event.list_id.filter((id): id is number => typeof id === 'number') : [],
  };
};
