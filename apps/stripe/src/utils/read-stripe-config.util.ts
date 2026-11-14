import { type StripeConfig } from 'src/types/stripe-config';

const value = (raw: string | undefined) => (raw && raw.trim() !== '' ? raw.trim() : null);

export const readStripeConfig = (env: Record<string, string | undefined> = process.env): StripeConfig => ({
  secretKey: value(env.STRIPE_SECRET_KEY),
  webhookSecret: value(env.STRIPE_WEBHOOK_SECRET),
  paymentMethods: (env.PAYMENT_METHODS ?? '')
    .split(',')
    .map((method) => method.trim())
    .filter((method) => method !== ''),
  publicBaseUrl: (value(env.TWENTY_FUNCTIONS_URL) ?? value(env.TWENTY_API_URL) ?? '').replace(/\/+$/, ''),
});
