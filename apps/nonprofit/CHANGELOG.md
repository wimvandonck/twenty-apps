# Changelog

All notable changes to this application are documented in this file.

## 0.2.0

- Membership types and memberships, for people or companies, linked to a payment
- New memberships get their name, period and amount from their type
- A payment's status flows to its registrations, memberships and orders
- Active memberships expire every night once their end date has passed
- Records linked to a payment take over its status right away
- Demo data includes membership types, memberships and, with the Consents app, consents

## 0.1.0

- Data model for events, ticket types, registrations, campaigns, donations, recurring donations, products, orders, order lines and payments, with relations to people and companies
- Table views, record pages and a navigation grouped into Events, Fundraising, Shop and Payments
- Translations into the 33 languages Twenty supports
- Demo data script, `yarn seed:demo`, with a clean command
- Menu folders placed after People and Companies; order lines only appear inside their order
