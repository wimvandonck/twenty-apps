# Changelog

All notable changes to this application are documented in this file.

## 0.1.0

- `POST /s/stripe/checkout` opens a Stripe Checkout for an open payment of the Nonprofit app
- A webhook records paid, pending, failed and expired checkouts on the payment, with the method used
- Thank-you and cancel pages in Dutch, French and English
