import { createHmac, timingSafeEqual } from 'node:crypto';

const TOLERANCE_SECONDS = 300;

// Checks the Stripe-Signature header of a webhook: an HMAC-SHA256 over
// "timestamp.body" with the endpoint's signing secret, at most five minutes
// old. Only v1 signatures count.
export const verifyStripeSignature = (payload: string, header: string, secret: string, nowSeconds: number): boolean => {
  const parts = header.split(',').map((part) => part.split('='));
  const timestamp = Number(parts.find(([key]) => key === 't')?.[1]);
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value ?? '');

  if (!Number.isFinite(timestamp) || signatures.length === 0 || Math.abs(nowSeconds - timestamp) > TOLERANCE_SECONDS) {
    return false;
  }

  const expected = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest();

  return signatures.some((signature) => {
    const actual = Buffer.from(signature, 'hex');

    return actual.length === expected.length && timingSafeEqual(actual, expected);
  });
};
