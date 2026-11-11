# Form Builder

A Twenty app for building public forms that create or update linked records, and embedding them on any website.

# Building a form

Open **Form builder** in the sidebar, or use the **Open in form builder** button on a form's record. The page shows the editor on the left and a live preview of the form on the right. In the header you pick or create a form, switch **Published** on or off, and save or discard your changes.

- **Fields** – add the records a submission writes and, per record, the fields to ask for. Each record is always created, or updates an existing record when a text or email field you choose matches. Per field you set the label, a default value, whether it is required and whether it is hidden. **Add page break** splits the form into steps; a break can carry a title for the step it starts. Records, fields and page breaks can be reordered and removed. Fields Twenty requires are added automatically and cannot be removed; system and read-only fields are never offered.
- **Links** – choose two records and the builder finds how they relate: through a relation field in either direction, or through a junction object such as note targets. When there are several ways, you pick one. Two objects without any relation in Twenty cannot be linked until you add a relation field in the data model.
- **Lists** – add the person of a submission to one of Twenty's lists, always or only when the visitor ticks a box whose text you write. Needs a person record in the form. Someone who is on the list already is not added twice.
- **Settings** – title, description, submit button and the message shown after submitting.
- **Share** – the public link and the embed code, once the form is published and saved.

A default value prefills a visible field. A hidden field is not shown to visitors and gets its default, if it has one, whatever is posted. A required field can only be hidden once it has a default that fills it. Every field type can have a default, including the parts of a name, an amount with its currency and an address. A date can default to **Today** and a date and time to **Now**, worked out when the form is opened, or when it is submitted for a hidden field (then in UTC).

# Steps

A form with page breaks shows one step at a time, with **Next** and **Back** buttons and "Step 1 of 3" above it. A step is checked before the visitor moves on. Breaks that would leave a step without visible fields are ignored.

# Prefilling from the link

Visible fields can be filled from the link: add `?person.emails=ann@example.com` to the form's address, made of the record's key (the object's name, such as `person`, or `person2` for a second one) and the field's name in Twenty. Parts of a field get a third name, such as `person.name.firstName`. In an embedded form, add them to the `src` of the iframe.

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

Both routes are public. A submission can only set the fields stored in the form's definition, only on published forms, and is validated in full before anything is written. If a write fails halfway, the records and list memberships that submission created are removed again. A hidden input catches simple bots.

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
