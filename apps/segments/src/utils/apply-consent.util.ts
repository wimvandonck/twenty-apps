// Keeps people without the required consent off a list that requires one.
// consented is null when the list requires no consent.
export const applyConsent = (
  add: string[],
  consented: Set<string> | null,
): { add: string[]; skipped: string[] } => {
  if (!consented) {
    return { add, skipped: [] };
  }

  return {
    add: add.filter((id) => consented.has(id)),
    skipped: add.filter((id) => !consented.has(id)),
  };
};
