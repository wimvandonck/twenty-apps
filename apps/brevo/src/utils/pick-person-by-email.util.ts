type PersonRow = { id: string; emails?: unknown };

// A like filter treats % and _ as wildcards and \ as their escape.
export const escapeLike = (value: string): string => value.replace(/[\\%_]/g, (character) => `\\${character}`);

// The one person whose primary email is exactly this one, ignoring case.
// Nobody when none or several match: an unsubscribe must never withdraw
// someone else's consents.
export const pickPersonByEmail = (rows: PersonRow[], email: string): string | null => {
  const wanted = email.trim().toLowerCase();
  const matches = rows.filter(
    (row) => String((row.emails as { primaryEmail?: unknown } | undefined)?.primaryEmail ?? '').trim().toLowerCase() === wanted,
  );

  return matches.length === 1 ? matches[0].id : null;
};
