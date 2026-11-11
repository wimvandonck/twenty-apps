// Returns a copy of the list with the item at `index` moved one place up
// (offset -1) or down (offset 1). Moves past either end change nothing.
export const moveItem = <T>(items: T[], index: number, offset: -1 | 1): T[] => {
  const target = index + offset;

  if (index < 0 || index >= items.length || target < 0 || target >= items.length) {
    return items;
  }

  const moved = [...items];

  [moved[index], moved[target]] = [moved[target], moved[index]];

  return moved;
};
