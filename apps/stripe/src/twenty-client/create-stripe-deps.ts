import { RestApiClient } from 'twenty-client-sdk/rest';

import { fetchPaymentMethodType } from 'src/stripe-client/fetch-payment-method-type';
import { stripeRequest } from 'src/stripe-client/stripe-request';
import { type StripeConfig } from 'src/types/stripe-config';
import { type PaymentRecord, type StripeDeps } from 'src/types/stripe-deps';

type OneResponse = { data: Record<string, (Record<string, unknown> & { id: string }) | null> };

const getOne = async (client: RestApiClient, namePlural: string, id: string) => {
  try {
    return Object.values((await client.get<OneResponse>(`/rest/${namePlural}/${id}`)).data)[0] ?? null;
  } catch {
    return null;
  }
};

// The payments of the Nonprofit app over Twenty's REST API, and Stripe's API.
export const createStripeDeps = (config: StripeConfig, client: RestApiClient = new RestApiClient()): StripeDeps => ({
  getPayment: async (id): Promise<PaymentRecord | null> => {
    const payment = await getOne(client, 'payments', id);

    if (!payment) {
      return null;
    }

    const amount = (payment.amount ?? {}) as { amountMicros?: number | null; currencyCode?: string | null };
    const payer = typeof payment.payerId === 'string' ? await getOne(client, 'people', payment.payerId) : null;
    const email = (payer?.emails as { primaryEmail?: string } | undefined)?.primaryEmail;

    return {
      id: payment.id,
      name: typeof payment.name === 'string' ? payment.name : '',
      status: typeof payment.status === 'string' ? payment.status : '',
      amountMicros: typeof amount.amountMicros === 'number' ? amount.amountMicros : null,
      currencyCode: amount.currencyCode ?? null,
      payerEmail: email && email !== '' ? email : null,
    };
  },
  updatePayment: async (id, patch) => {
    await client.patch(`/rest/payments/${id}`, patch);
  },
  createCheckoutSession: (params) =>
    stripeRequest<{ id: string; url: string }>(config.secretKey ?? '', 'POST', '/checkout/sessions', params),
  fetchPaymentMethodType: (paymentIntentId) => fetchPaymentMethodType(config.secretKey ?? '', paymentIntentId),
});
