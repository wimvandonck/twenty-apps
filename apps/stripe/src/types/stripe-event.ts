export type StripeEvent = {
  type: string;
  created: number;
  data?: { object?: Record<string, unknown> };
};
