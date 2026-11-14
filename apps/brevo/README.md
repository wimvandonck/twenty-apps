# Brevo sync

An optional Twenty app that keeps Brevo in step with the Consents app and with Twenty's lists. Twenty stays the source: consents and memberships are recorded there and copied to Brevo, and unsubscribes in Brevo come back as withdrawn consents.

# What it syncs

- **Consents → contact attributes.** Every email type becomes a true or false contact attribute named `CONSENT_` and the type's name in capitals, without accents or punctuation: "Nieuwsbrief" becomes `CONSENT_NIEUWSBRIEF`. The app creates the attribute in Brevo when it is first needed. Build segments in Brevo on these attributes, such as "CONSENT_NIEUWSBRIEF is true".
- **Lists → Brevo lists.** Lists with **Sync met Brevo** ticked get a Brevo list of the same name, in the folder set in the app's settings. Its id is kept in the list's **Brevo list ID** field. Joining or leaving such a list in Twenty, also through a form or the preferences page, adds or removes the contact in Brevo.
- **Names.** Contacts get `FIRSTNAME` and `LASTNAME`.
- **Every night**, every member of every synced list is written to Brevo again with their consents, to catch up on anything missed. A contact Brevo refuses is skipped and logged; when Brevo's rate limit is reached, the rest waits for the next night.

People without an email address are skipped.

# Unsubscribes

When someone unsubscribes from a Brevo campaign, Brevo's webhook tells the app. The app withdraws all their consents in the Consents app, with Brevo as the source, and takes them off the Twenty lists the campaign was sent to. Brevo itself blocks the contact for marketing mails. The app only acts when exactly one person in Twenty has that email address, ignoring case; otherwise it changes nothing.

To let people leave one kind of email without leaving all of them, use the preferences link of the Consents app (the person's **Preferences link** field) as the unsubscribe link in your campaigns instead of Brevo's own.

# Setting up

1. Create an API key in Brevo (SMTP & API → API keys) and choose a long random webhook token.
2. In Twenty, open the app's settings and fill in **Brevo API key** and **Webhook token**. **Brevo folder** is where new lists go, "Twenty" by default.
3. In Brevo, add a marketing webhook (Contacts → Settings → Webhooks) for **Unsubscribed**, with this address, replacing the host with your workspace's public functions address and the token with yours:

   ```
   https://<workspace>.withtwenty.com/s/brevo/webhook?token=<your-token>
   ```

   Brevo only passes the token in the address, so it can end up in access logs. Change it now and then, in both places at once.

4. Tick **Sync met Brevo** on the lists to sync.

Without an API key the app does nothing.

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
