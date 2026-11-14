export type ListChanges = {
  add: string[];
  remove: string[];
};

// Works out who joins and who leaves the list.
//
// - Someone who matches now but did not match last time joins.
// - Someone who matched last time but no longer does leaves, if still on
//   the list.
// - Someone who kept matching but is no longer on the list was removed by
//   hand or unsubscribed, and is not put back.
// - Someone added by hand who never matched is left alone.
//
// A static segment is calculated once: everyone who matches joins, and
// nobody leaves.
export const computeListChanges = (
  matchedNow: Set<string>,
  matchedBefore: Set<string>,
  currentMembers: Set<string>,
  isStatic: boolean,
): ListChanges => {
  if (isStatic) {
    return { add: [...matchedNow].filter((id) => !currentMembers.has(id)).sort(), remove: [] };
  }

  const add = [...matchedNow].filter((id) => !matchedBefore.has(id) && !currentMembers.has(id)).sort();
  const remove = [...matchedBefore].filter((id) => !matchedNow.has(id) && currentMembers.has(id)).sort();

  return { add, remove };
};
