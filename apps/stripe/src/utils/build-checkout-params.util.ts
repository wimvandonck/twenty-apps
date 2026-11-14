import { type CheckoutInput } from 'src/types/checkout-input';
import { toMinorUnits } from 'src/utils/to-minor-units.util';

// The form-encoded body of a Stripe Checkout Session for one payment: one
// line for the whole amount, with the payment's id to find it back.
export const buildCheckoutParams = (input: CheckoutInput): URLSearchParams => {
  const params = new URLSearchParams({
    mode: 'payment',
    'line_items[0][price_data][currency]': input.currencyCode.toLowerCase(),
    'line_items[0][price_data][unit_amount]': String(toMinorUnits(input.amountMicros, input.currencyCode)),
    'line_items[0][price_data][product_data][name]': input.name.trim() || 'Payment',
    'line_items[0][quantity]': '1',
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    client_reference_id: input.paymentId,
    'metadata[paymentId]': input.paymentId,
    'payment_intent_data[metadata][paymentId]': input.paymentId,
  });

  if (input.customerEmail) {
    params.set('customer_email', input.customerEmail);
  }

  if (input.locale) {
    params.set('locale', input.locale);
  }

  for (const method of input.paymentMethods) {
    params.append('payment_method_types[]', method);
  }

  return params;
};
