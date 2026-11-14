import { RestApiClient } from 'twenty-client-sdk/rest';

import { type GroupRequest, type SegmentDeps } from 'src/types/segment-deps';

type GraphqlResponse<T> = { data?: T; errors?: { message: string }[] };
type Page<T> = { edges: { node: T }[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };

export type ListMember = { id: string; personId: string };

export type SegmentRecord = {
  id: string;
  name: string | null;
  mode: 'DYNAMIC' | 'STATIC' | null;
  definition: unknown;
  listId: string | null;
  matchedPersonIds: unknown;
};

const PAGE_SIZE = 200;
const GROUP_LIMIT = 20_000;

// Everything the app reads from and writes to Twenty.
export const createTwentyApi = (client: RestApiClient = new RestApiClient()) => {
  const graphql = async <T>(query: string, variables: Record<string, unknown> = {}): Promise<T> => {
    const response = await client.post<GraphqlResponse<T>>('/graphql', { query, variables });

    if (response.errors?.length) {
      throw new Error(response.errors.map((error) => error.message).join('; '));
    }

    if (!response.data) {
      throw new Error('Twenty returned no data');
    }

    return response.data;
  };

  // Filters are typed per object, such as DonationFilterInput for the
  // donations queries. The object's singular name gives the type.
  let singularByPlural: Promise<Map<string, string>> | undefined;
  const filterTypeOf = async (queryName: string): Promise<string> => {
    singularByPlural ??= client
      .post<GraphqlResponse<{ objects: { edges: { node: { nameSingular: string; namePlural: string } }[] } }>>(
        '/metadata',
        { query: '{ objects(paging: { first: 1000 }) { edges { node { nameSingular namePlural } } } }' },
      )
      .then((response) => {
        if (!response.data) {
          throw new Error(response.errors?.map((error) => error.message).join('; ') ?? 'Twenty returned no objects');
        }

        return new Map(response.data.objects.edges.map(({ node }) => [node.namePlural, node.nameSingular]));
      });

    const plural = queryName.replace(/GroupBy$/, '');
    const singular = (await singularByPlural).get(plural);

    if (!singular) {
      throw new Error(`Twenty has no object "${plural}"`);
    }

    return `${singular.charAt(0).toUpperCase()}${singular.slice(1)}FilterInput`;
  };

  const fetchAll = async <T>(queryName: string, selection: string, filter?: Record<string, unknown>): Promise<T[]> => {
    const filterType = await filterTypeOf(queryName);
    const records: T[] = [];
    let after: string | null = null;

    do {
      const data: Record<string, Page<T>> = await graphql(
        `query ($filter: ${filterType}, $after: String) {
          page: ${queryName}(filter: $filter, first: ${PAGE_SIZE}, after: $after) {
            edges { node { ${selection} } }
            pageInfo { hasNextPage endCursor }
          }
        }`,
        { filter: filter ?? null, after },
      );

      records.push(...data.page.edges.map((edge) => edge.node));
      after = data.page.pageInfo.hasNextPage ? data.page.pageInfo.endCursor : null;
    } while (after);

    return records;
  };

  const groupRelated = async (request: GroupRequest) => {
    const queryName = `${request.object}GroupBy`;
    const filterType = await filterTypeOf(queryName);
    const data = await graphql<Record<string, { groupByDimensionValues: (string | null)[]; [key: string]: unknown }[]>>(
      `query ($filter: ${filterType}, $viewId: UUID) {
        groups: ${queryName}(groupBy: [{ ${request.relation}: { id: true } }], filter: $filter, viewId: $viewId, limit: ${GROUP_LIMIT}) {
          groupByDimensionValues
          ${request.aggregateField}
        }
      }`,
      { filter: request.filter ?? null, viewId: request.viewId ?? null },
    );

    const groups = data.groups;

    if (groups.length >= GROUP_LIMIT) {
      throw new Error(`More than ${GROUP_LIMIT} people matched one condition; the segment cannot be calculated yet`);
    }

    const values = new Map<string, number>();

    for (const group of groups) {
      const personId = group.groupByDimensionValues[0];
      const raw = group[request.aggregateField];

      if (!personId || raw === null || raw === undefined) {
        continue;
      }

      const value = typeof raw === 'string' ? Date.parse(raw) : Number(raw);

      if (!Number.isNaN(value)) {
        values.set(personId, value);
      }
    }

    return { values };
  };

  const fetchListMembers = (listId: string) =>
    fetchAll<ListMember>('messageListMembers', 'id personId', { listId: { eq: listId } });

  const deps: SegmentDeps = {
    groupRelated,
    findPersonIds: async (filter) => (await fetchAll<{ id: string }>('people', 'id', filter)).map((p) => p.id),
    findAllPersonIds: async () => (await fetchAll<{ id: string }>('people', 'id')).map((p) => p.id),
    findPersonLinks: async (via) => {
      const people = await fetchAll<Record<string, string | null>>('people', `id ${via}Id`);

      return new Map(
        people.flatMap((person) => {
          const linkedId = person[`${via}Id`];
          return person.id && linkedId ? [[person.id, linkedId] as [string, string]] : [];
        }),
      );
    },
    findListMemberIds: async (listId) => (await fetchListMembers(listId)).map((member) => member.personId),
  };

  return {
    deps,
    fetchListMembers,
    fetchSegment: async (id: string): Promise<SegmentRecord | null> => {
      const data = await graphql<{ segment: SegmentRecord | null }>(
        `query ($id: UUID!) { segment(filter: { id: { eq: $id } }) { id name mode definition listId matchedPersonIds } }`,
        { id },
      );

      return data.segment;
    },
    fetchDynamicSegmentIds: async (): Promise<string[]> =>
      (await fetchAll<{ id: string }>('segments', 'id', { mode: { eq: 'DYNAMIC' } })).map((s) => s.id),
    addListMember: async (listId: string, personId: string) => {
      await client.post('/rest/messageListMembers', { listId, personId });
    },
    removeListMember: async (memberId: string) => {
      await client.delete(`/rest/messageListMembers/${memberId}`);
    },
    // The Consents app adds a required email type to lists. Without that app
    // the field does not exist and no consent is required.
    fetchRequiredEmailTypeId: async (listId: string): Promise<string | null> => {
      try {
        const data = await graphql<{ messageList: { requiredEmailTypeId: string | null } | null }>(
          `query ($id: UUID!) { messageList(filter: { id: { eq: $id } }) { requiredEmailTypeId } }`,
          { id: listId },
        );

        return data.messageList?.requiredEmailTypeId ?? null;
      } catch (error) {
        if (error instanceof Error && error.message.includes('requiredEmailTypeId')) {
          return null;
        }

        throw error;
      }
    },
    fetchConsentedPersonIds: async (emailTypeId: string): Promise<Set<string>> =>
      new Set(
        (
          await fetchAll<{ personId: string }>('consents', 'personId', {
            emailTypeId: { eq: emailTypeId },
            status: { eq: 'GRANTED' },
          })
        ).map((consent) => consent.personId),
      ),
    updateSegment: async (id: string, data: Record<string, unknown>) => {
      await client.patch(`/rest/segments/${id}`, data);
    },
  };
};

export type TwentyApi = ReturnType<typeof createTwentyApi>;
