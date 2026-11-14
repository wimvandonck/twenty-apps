# Consents

A Twenty app that records who agreed to receive which kind of email, keeps the proof, confirms new sign-ups by email and gives every person a page to change their choices.

Twenty decides who gets a campaign by list membership and lets people unsubscribe, but it does not record consent. This app separates the two:

- **Consent** is the legal permission to send someone a kind of email, such as "Newsletter". It needs proof.
- **A list** is a preference within that permission, such as "Newsletter about climate". A list can require an email type.

Brevo is optional. Without it the app records and confirms consents the same way; only the confirmation mail goes out through a Twenty workflow instead.

# Objects

| Object | API name | What one record is |
| --- | --- | --- |
| Email type | `emailType` | A kind of email that needs consent, such as the newsletter |
| Consent | `consent` | A person's current consent for one email type: pending, granted or withdrawn |
| Consent change | `consentChange` | One request, confirmation, grant or withdrawal, kept as proof |

Each change stores when it happened, its source (form, preferences page, manual, import, API, Brevo), the text the person saw, the form, the IP address and the browser. The app never edits or deletes changes.

The status of a consent is always the status its changes lead to. When someone changes the status in Twenty to granted or withdrawn, the app logs a manual change. A status set to pending by hand is put back, since nothing proves it.

On **lists** the app adds **Show on preferences page** and **Required email type**. On **people** it adds their **Consents** and a **Preferences link**.

# Recording a consent

Other apps, such as the form builder, record changes through an authenticated route:

```
POST /s/consents/changes
```

```json
{
  "personId": "…",
  "changes": [
    {
      "emailTypeId": "…",
      "action": "REQUESTED",
      "source": "FORM",
      "shownText": "Yes, send me the newsletter",
      "formName": "Newsletter sign-up",
      "language": "nl"
    }
  ],
  "ipAddress": "203.0.113.7",
  "userAgent": "Mozilla/5.0 …"
}
```

`action` is `REQUESTED` (needs confirmation), `CONFIRMED`, `GRANTED` (counts at once) or `WITHDRAWN`. `ipAddress` and `userAgent` are the visitor's, for a caller that relays a public request. The answer lists the resulting status per email type and whether the confirmation mail went out.

Someone who already gave consent and fills in a form again keeps their consent and gets no new mail. Changes can also be added by hand or imported as consent change records; the consent follows them.

# Double opt-in

All `REQUESTED` changes of one call share a submission. The consents become pending and get a **Confirmation link** that works for 30 days. One mail lists every email type of the submission, and one click confirms them all. A consent withdrawn before the click stays withdrawn.

With a Brevo key the app sends the mail itself. A mail that fails because of Brevo's daily limit or an error on their side is retried every hour.

## Without Brevo

Send the mail with a Twenty workflow:

1. Create a workflow with the trigger **Record is updated** on **Consents**, on the field **Confirmation link**.
2. Add a filter: **Status** is **Pending** and **Confirmation link** is not empty.
3. Add **Send Email** from a connected mailbox, to the consent's person, with the **Confirmation link** in the body.

# Preferences page

Every person gets a personal link, `/s/consents/preferences?token=…`, in their **Preferences link** field. Use it as the unsubscribe or "manage your preferences" link in Brevo and Twenty mails.

The page has two parts:

- **Permission**: every active email type, to switch on or off. A change here counts at once and is logged with the page as its source, since only the person can open their link.
- **Topics**: the lists marked **Show on preferences page**, under the email type they require. Lists under an email type that is off are greyed out and keep their membership, so the choice comes back with the consent.

Links are signed with the signing secret. Changing the secret makes every link sent so far stop working.

# Settings

| Setting | Required | What it is for |
| --- | --- | --- |
| Signing secret | Yes | Signs confirmation and preference links. Use a long random string. |
| Organization name | Yes | Shown in the mail and on the pages |
| Brevo API key | No | Sends confirmation mails through Brevo |
| Sender email | With Brevo | Must be a verified sender in Brevo |
| Sender name | With Brevo | The name the mail comes from |

People who existed before the signing secret was set get their preferences link within the hour.

# Languages

The mail and the public pages are in Dutch, French and English and follow the language of the form or the browser; other languages get English. Add `?lang=fr` to a page link to force one. Object and field labels are translated into Dutch and French in `locales/`.

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
