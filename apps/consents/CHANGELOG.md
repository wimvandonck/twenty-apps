# Changelog

All notable changes to this application are documented in this file.

## 0.1.0

- Email types, consents and consent changes, with the status of a consent always following its history
- `POST /s/consents/changes` for other apps to record consents
- Double opt-in: one confirmation mail and link per submission, sent through Brevo when a key is set, retried every hour
- Public confirmation page and personal preferences page with permission and topic sections
- Lists can require an email type and be shown on the preferences page
- A preferences link on every person
- Mail and pages in Dutch, French and English; labels in Dutch and French
