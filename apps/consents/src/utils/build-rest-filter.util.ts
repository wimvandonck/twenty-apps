import { type RecordWhere } from 'src/types/record-store';

// Twenty's REST filter for records whose fields all equal the given values.
export const buildRestFilter = (where: RecordWhere): string | undefined => {
  const conditions = Object.entries(where).map(([field, value]) => {
    if (value === null) {
      return `${field}[is]:NULL`;
    }

    if (typeof value === 'boolean') {
      return `${field}[eq]:${value}`;
    }

    return `${field}[eq]:${JSON.stringify(value)}`;
  });

  return conditions.length > 0 ? conditions.join(',') : undefined;
};
