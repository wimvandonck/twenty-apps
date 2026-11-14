// A readable name for a record: its name, full name or title, else its id.
export const recordLabel = (record: { id: string } & Record<string, unknown>): string => {
  if (typeof record.name === 'string' && record.name.trim() !== '') {
    return record.name;
  }

  if (typeof record.name === 'object' && record.name !== null) {
    const { firstName, lastName } = record.name as { firstName?: string; lastName?: string };
    const full = [firstName, lastName].filter((part) => part && part.trim() !== '').join(' ');

    if (full !== '') {
      return full;
    }
  }

  if (typeof record.title === 'string' && record.title.trim() !== '') {
    return record.title;
  }

  return record.id;
};
