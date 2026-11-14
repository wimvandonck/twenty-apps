# Segments

A Twenty app that keeps a list filled with the people who meet a set of conditions, such as "gave at least 50 euro in the past year". Twenty's own filters can't look at linked records with a sum or a count, and its lists don't fill themselves. This app adds both.


# How it works

A **segment** has a name, a type, a definition and a list:

- **Dynamic** segments are recalculated every 15 minutes and whenever their definition, type or list changes.
- **Static** segments are calculated when they are created or changed, and only add people.

The members end up in an ordinary Twenty list, so everything built on lists keeps working: email campaigns, the Brevo sync and the preferences page of the Consents app.

When a dynamic segment is recalculated:

- people who now match and didn't before join the list
- people who matched before and no longer do leave it
- people who still match but were removed from the list by hand, or unsubscribed, are not put back
- people added to the list by hand who never matched are left alone
- on a list that requires an email type in the Consents app, only people who gave that consent join. The others are skipped and join as soon as they give it

**Matches**, **Last calculated** and **Last result** show the outcome. **Last result** reads, for example, "2 joined, 1 left, 3 skipped without consent", or explains what went wrong.

# Building conditions

Open a segment and go to the **Conditions** tab. Choose whether people must meet all conditions or at least one, and add conditions:

- **Linked records**: for example donations through their donor. Choose which records count with **Which records**: all of them, or a saved view on that object. Build that view with Twenty's own filters, such as "status is Received" and "received in the past year". Then choose what to measure (the number of records, or the total, average, highest or lowest of a field) and the comparison.
- **Own field**: a field of the person, such as job title or an email address.
- **List**: whether the person is on a list.
- **Group**: a nested set of conditions with its own all or at least one.

Below the conditions, the editor counts who matches and shows a few names. **Save** stores the conditions and updates the list right away.

# Writing a definition by hand

The editor stores the conditions as JSON in the segment's **Definition** field. You can also write it yourself, for example to use a filter the editor doesn't offer:

```json
{
  "match": "ALL",
  "conditions": [
    {
      "type": "related",
      "object": "donations",
      "relation": "donor",
      "filter": { "status": { "eq": "RECEIVED" }, "receivedOn": { "gte": "@today-12M" } },
      "measure": { "aggregate": "SUM", "field": "amount.amountMicros" },
      "operator": "GTE",
      "value": 50
    },
    { "type": "property", "filter": { "jobTitle": { "ilike": "%volunteer%" } } }
  ]
}
```

`match` is `ALL` (every condition) or `ANY` (at least one). There are four kinds of condition:

| Type | Matches people who | Fields |
| --- | --- | --- |
| `related` | have linked records of another object that pass a test | `object`: plural API name, such as `donations` or `registrations`. `relation`: the field on that object that points at the person, such as `donor` or `attendee`. `filter` or `viewId`: which records count. `measure`, `operator`, `value`: the test. |
| `property` | match a filter on their own fields | `filter` |
| `list` | are, or are not, on a list | `listId`, `isMember` (default `true`) |
| `group` | meet a nested set of conditions | `match`, `conditions` |

For a `related` condition:

- `measure` is `{ "aggregate": "COUNT" }` by default. `SUM`, `AVG`, `MIN` and `MAX` take a `field`, such as `amount.amountMicros` for an amount or `receivedOn` for a date. Amounts are compared in whole euros.
- `operator` is `GTE` (default), `GT`, `LTE`, `LT`, `EQ` or `NEQ`, and `value` defaults to 1. So the shortest condition means "has at least one".
- A count or sum of 0 also matches people without any linked record, so `"operator": "EQ", "value": 0` finds people who never donated.
- `viewId` uses the filters of a saved view on that object. Twenty applies them itself, including relative dates.

Filters use Twenty's GraphQL filter format. Anywhere in a filter or a value, `@today` and `@now` stand for today's date and the current time, optionally shifted with `+` or `-` and a number of days (`d`), weeks (`w`), months (`M`) or years (`y`): `@today-12M`, `@now-7d`.

# Limitations

- Not real-time: dynamic segments are at most 15 minutes behind.
- The base is always people. A `related` condition follows one link from the linked object to the person; links over several steps come later.
- Grouping linked records per person works but isn't documented by Twenty, so an update could change it.

# Languages

The labels and the editor are translated into the 33 languages Twenty supports, in `locales/`. The translations were machine-written and have not been reviewed by native speakers. `twenty app translations extract` only sees the strings in `src/front-components/segment-editor.tsx` itself, not in the components it imports, so add new editor strings to every file in `locales/` by hand.

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
