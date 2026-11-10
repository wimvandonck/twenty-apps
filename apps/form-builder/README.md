# Form Builder

A Twenty app for building public forms that create or update linked records, and embedding them on any website.

# Building a form

Open **Form builder** in the sidebar. It is a full page: pick a form at the top, or name a new one and choose **Create form**.

- **Records and fields** – add the objects a submission writes. Each record is always created, or updates an existing record when a text or email field you choose matches. Per field you set the label, a default value, whether it is required and whether it is hidden. Fields Twenty requires are always included and required; system and read-only fields are never offered.
- **Links between records** – choose two records and the builder finds how they relate: through a relation field in either direction, or through a junction object such as note targets. When there are several ways, you pick one. Two objects without any relation in Twenty cannot be linked until you add a relation field in the data model.
- **Form settings and sharing** – set the title and messages, tick **Published**, save, and copy the public link or the embed code.

A default value prefills a visible field. A hidden field is not shown to visitors and gets its default, if it has one, whatever is posted. A required field can only be hidden once it has a default.

# Languages

The builder and the object labels are translated into the 33 languages Twenty supports, in `locales/`. The texts the public form adds itself (part labels such as "First name", validation messages) are in `src/constants/public-form-messages.json`. The public form follows the visitor's browser language; add `?lang=nl-NL` to the link to force one. The translations were machine-written and have not been reviewed by native speakers.

After changing a string in the builder, update every file in `locales/` by hand. `twenty app translations extract` only sees strings in the front component's own file, not in the components it imports.

# How it works

| Part | Where |
| --- | --- |
| `Form` object with its `definition` (JSON) and `isPublished` fields | `src/objects`, `src/fields` |
| Builder page | `src/front-components`, `src/page-layouts/form-builder.page-layout.ts` |
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
