import { createHash, timingSafeEqual } from 'node:crypto';

const digest = (value: string) => createHash('sha256').update(value).digest();

// Brevo webhooks carry the token in their address; compared in constant time.
export const isValidWebhookToken = (given: string | undefined, expected: string | null): boolean =>
  typeof given === 'string' && expected !== null && expected !== '' && timingSafeEqual(digest(given), digest(expected));
