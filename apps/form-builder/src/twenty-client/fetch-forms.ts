import { RestApiClient } from 'twenty-client-sdk/rest';

import { type FormSummary } from 'src/types/form-summary';

type FormsResponse = {
  data: {
    forms: Array<{ id: string; name: string | null; isPublished: boolean | null; definition: unknown }>;
  };
};

export const fetchForms = async (client: RestApiClient): Promise<FormSummary[]> => {
  const response = await client.get<FormsResponse>('/rest/forms', {
    query: { limit: 200, order_by: 'createdAt[DescNullsLast]' },
  });

  return response.data.forms.map((form) => ({
    id: form.id,
    name: form.name ?? '',
    isPublished: form.isPublished === true,
    definition: form.definition,
  }));
};
