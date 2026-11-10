# Form Builder

A Twenty app for building public forms that create or update linked records, and embedding them on any website.

# Building a form

Create a record under **Forms**, open it and use the **Builder** tab:

1. **Records** – pick the objects a submission writes. Each record is always created, or updates an existing record when a text or email field you choose matches.
2. **Links** – connect the records of one submission through their relations, for example the new person to the new company.
3. **Fields** – tick the fields to ask for. Fields Twenty requires are always included and required; system and read-only fields are never offered.
4. **Publish** – set the title and messages, tick **Published**, save, and copy the public link or the embed code.

# How it works

| Part | Where |
| --- | --- |
| `Form` object with its `definition` (JSON) and `isPublished` fields | `src/objects`, `src/fields` |
| Builder UI | `src/front-components` |
| `GET /forms/:formId` – serves the form as an HTML page | `src/logic-functions/render-form.ts` |
| `POST /forms/:formId` – validates a submission and writes the records | `src/logic-functions/submit-form.ts` |

Both routes are public. A submission can only set the fields stored in the form's definition, only on published forms, and is validated in full before anything is written. If a write fails halfway, the records that submission created are removed again. A hidden input catches simple bots.

Supported field types: text, number, boolean, date, date and time, select, multi-select, emails, phones, links, full name, currency, address and rich text.

# Development

```bash
yarn install
```

```bash
yarn test:unit
```

```bash
twenty app typecheck
```

```bash
twenty app apply
```
