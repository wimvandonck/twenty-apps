import { type ChangeRequest } from 'src/types/change-request';
import { type RecordStore } from 'src/types/record-store';

// The person and email types of a request that do not exist, so the route can
// refuse it before writing anything.
export const findMissingTargets = async (store: RecordStore, request: ChangeRequest): Promise<string[]> => {
  const emailTypeIds = [...new Set(request.changes.map(({ emailTypeId }) => emailTypeId))];
  const [person, ...emailTypes] = await Promise.all([
    store.findOne('people', request.personId),
    ...emailTypeIds.map((id) => store.findOne('emailTypes', id)),
  ]);

  return [
    ...(person ? [] : [`personId ${request.personId} does not exist`]),
    ...emailTypeIds.filter((_, index) => !emailTypes[index]).map((id) => `emailTypeId ${id} does not exist`),
  ];
};
