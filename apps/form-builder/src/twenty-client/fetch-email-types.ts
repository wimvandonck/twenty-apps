import { RestApiClient } from 'twenty-client-sdk/rest';

import { type EmailTypeSummary } from 'src/types/email-type-summary';

type EmailTypesResponse = {
  data: Record<string, Array<{ id: string; name: string | null; consentText?: string | null }>>;
};

// The active email types of the Consents app, or null when that app is not
// installed. Forms work without it.
export const fetchEmailTypes = async (client: RestApiClient): Promise<EmailTypeSummary[] | null> => {
  try {
    const response = await client.get<EmailTypesResponse>('/rest/emailTypes', {
      query: { filter: 'isActive[eq]:true', limit: 200 },
    });

    return (Object.values(response.data)[0] ?? [])
      .map(({ id, name, consentText }) => ({ id, name: name ?? '', consentText: consentText ?? '' }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return null;
  }
};
