# Nonprofit

A Twenty app with the data model non-profits need for event registrations, donations and a small shop. Each registration, donation and order is a record of its own, so it carries its own status, amount, preferences and payment instead of being a plain link between a person and an event or product.

This version contains the data model only. Forms, payment providers and automation come later and will build on these objects.

# Objects

| Object | API name | What one record is |
| --- | --- | --- |
| Event | `organizedEvent` | An event people can register for, free or paid |
| Ticket type | `ticketType` | A price tier of an event, such as member or early bird |
| Registration | `registration` | One attendee registered for an event |
| Campaign | `campaign` | A fundraising campaign or purpose donations go to |
| Donation | `donation` | One gift: one-off, or one collection of a recurring donation |
| Recurring donation | `recurringDonation` | An agreement to give a fixed amount at a fixed interval |
| Product | `product` | Something the organisation sells |
| Order | `order` | A purchase of one or more products |
| Order line | `orderLine` | One product in an order, with quantity and price at the time of ordering |
| Payment | `payment` | A payment for registrations, a donation or an order |

`event` is a reserved name in Twenty, so the event object is called `organizedEvent` in the API. Its label is still "Event".

# Relations

- An event has ticket types and registrations. Deleting an event deletes both.
- A registration links to its attendee (a person), optionally the person who booked it, a company, a ticket type and a payment. One payment can cover several registrations, for example when one person books for a group.
- A donation links to a donor (a person) or a company, and optionally a campaign, a recurring donation and a payment. Every collection of a recurring donation is its own donation, so totals and tax certificates always come from donations.
- An order links to a customer (a person) or a company and a payment, and has order lines. Each order line links to a product and keeps the unit price at the time of ordering.
- A payment links to the person who paid.

On people and companies, the matching lists appear: registrations, booked registrations, donations, recurring donations, orders and payments.

# Optional by design

Organisations differ, so nearly everything is optional. Leave ticket types out for events with one price, leave capacity empty for unlimited events, and ignore company, campaign or tax-deductible fields where they don't apply.

- **Event price** is the default price per attendee; empty means free. Ticket types override it.
- **Payment status** on a registration is a copy of its payment's status. Twenty can't filter records on a field of a related record, so the copy makes "unpaid registrations" a simple filter. Payment automation will keep it in sync later.
- **Answers** on a registration is a JSON field for questions specific to one event. Recurring questions have their own fields: dietary requirements, accessibility needs and remarks.
- **Totals** (order total, line total) are stored values. Twenty has no formula fields, so they will be calculated by a logic function later.

# Languages

Object names, field labels, descriptions, views and the navigation are translated into the 33 languages Twenty supports, in `locales/`. Select option labels such as "Confirmed" or "Monthly" are not covered: `twenty app translations extract` does not extract them. The translations were machine-written and have not been reviewed by native speakers.

After changing a label or description, run the extract command and add the new strings to every file in `locales/`:

```bash
twenty app translations extract
```

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
