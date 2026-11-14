const STRIPE_API = 'https://api.stripe.com/v1';

// One call to Stripe's API with the secret key. Throws with Stripe's message
// when it refuses.
export const stripeRequest = async <T>(
  secretKey: string,
  method: 'GET' | 'POST',
  path: string,
  body?: URLSearchParams,
): Promise<T> => {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${secretKey}`,
      ...(body ? { 'content-type': 'application/x-www-form-urlencoded' } : {}),
    },
    ...(body ? { body: body.toString() } : {}),
  });
  const json = (await response.json().catch(() => ({}))) as T & { error?: { message?: string } };

  if (!response.ok) {
    throw new Error(`Stripe answered ${response.status}: ${json.error?.message ?? 'unknown error'}`);
  }

  return json;
};
