import { RestApiClient, RestApiClientError } from 'twenty-client-sdk/rest';

import { type FormDefinition } from 'src/types/form-definition';
import { parseFormDefinition } from 'src/utils/parse-form-definition.util';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type FormResponse = {
  data: { form: { isPublished: boolean; definition: unknown } | null };
};

// The definition of a form that is published and valid, or null. Unknown,
// unpublished and broken forms are indistinguishable to the public.
export const fetchPublishedForm = async (
  client: RestApiClient,
  formId: string | undefined,
): Promise<FormDefinition | null> => {
  if (formId === undefined || !UUID.test(formId)) {
    return null;
  }

  try {
    const response = await client.get<FormResponse>(`/rest/forms/${formId}`);
    const form = response.data.form;

    return form?.isPublished === true ? parseFormDefinition(form.definition) : null;
  } catch (error) {
    if (error instanceof RestApiClientError && (error.status === 404 || error.status === 400)) {
      return null;
    }

    throw error;
  }
};
