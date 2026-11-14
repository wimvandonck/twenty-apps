// Objects a public form must never point at: a visitor could attach a
// submission to someone else's payment or person, and the dropdown would
// publish their names. Singular for the builder, plural for the server.
export const PROTECTED_RELATION_TARGETS = [
  { singular: 'form', plural: 'forms' },
  { singular: 'person', plural: 'people' },
  { singular: 'payment', plural: 'payments' },
  { singular: 'membership', plural: 'memberships' },
  { singular: 'workspaceMember', plural: 'workspaceMembers' },
  { singular: 'consent', plural: 'consents' },
  { singular: 'consentChange', plural: 'consentChanges' },
];
