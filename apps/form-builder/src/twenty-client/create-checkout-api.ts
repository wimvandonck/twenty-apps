import { RestApiClient } from 'twenty-client-sdk/rest';

import { type CheckoutApi } from 'src/types/checkout-api';

// Opens a checkout through the route of the Stripe app.
export const createCheckoutApi = (client: RestApiClient): CheckoutApi => ({
  start: async (request) => {
    const response = await client.post<{ ok?: boolean; url?: string }>('/s/stripe/checkout', request);

    return response.ok && typeof response.url === 'string' ? { url: response.url } : null;
  },
});
