# Stripe payments

A Twenty app that lets visitors pay the payments of the Nonprofit app online through [Stripe Checkout](https://docs.stripe.com/payments/checkout), and records the outcome on the payment.

It needs the Nonprofit app, whose `payment` object it reads and updates. The Form Builder uses it when a form's total is set to **Pay online with Stripe**: after sending, the visitor goes straight to Stripe and comes back to a thank-you page.

# How it works

1. Another app asks for a checkout for an open payment through an authenticated route:

   ```
   POST /s/stripe/checkout
   ```

   ```json
   { "paymentId": "…", "locale": "nl", "successUrl": "https://…", "cancelUrl": "https://…" }
   ```

   The return addresses are optional; without them Stripe sends the visitor to this app's own thank-you or cancel page. The answer holds the checkout's `url`.
2. The app creates a Checkout Session for the payment's name and amount, with the payer's email filled in, and sets the payment to **Pending** with provider **Stripe**.
3. Stripe calls the app's webhook when the checkout completes, a delayed method such as SEPA direct debit succeeds or fails, or the checkout expires. The payment becomes **Paid** (with the time, the payment intent and the method used: card, Bancontact, SEPA direct debit, PayPal or other), **Failed** or **Expired**. A paid or refunded payment is never set back by a late event. Only the latest checkout can fail or expire a payment; money received through an older one is still recorded.
4. Starting a new checkout for a payment that still has one open closes the old one first, so the payer can't pay twice. While a delayed method such as SEPA direct debit is on its way, no new checkout opens.

The Nonprofit app then passes the payment's status on to the registrations, memberships and orders it pays for.

# Setting up

1. In the Stripe dashboard, copy the **secret key** (use a `sk_test_…` key to try).
2. Add a webhook endpoint in Stripe (Developers → Webhooks) with this address, replacing the host with your workspace's public functions address:

   ```
   https://<workspace>.withtwenty.com/s/stripe/webhook
   ```

   Send these events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `checkout.session.expired`.
3. Copy the endpoint's **signing secret** (`whsec_…`).
4. In Twenty, open the app's settings and fill in:

| Setting | Required | What it is for |
| --- | --- | --- |
| Stripe secret key | Yes | Creates checkouts and reads the method used |
| Stripe webhook signing secret | Yes | Checks that webhook calls come from Stripe |
| Payment methods | No | Stripe method types separated by commas, such as `card,bancontact`. Empty uses the methods enabled in your Stripe dashboard. |

Webhook calls without a valid signature, or older than five minutes, are refused.

# Development

```bash
yarn install
```

```bash
yarn test:unit
```

```bash
yarn typecheck
```

```bash
twenty app apply
```
