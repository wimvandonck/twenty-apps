import { RestApiClient } from 'twenty-client-sdk/rest';

import { type ConsentApi } from 'src/types/consent-api';

// Records consents through the route of the Consents app.
export const createConsentApi = (client: RestApiClient): ConsentApi => ({
  record: async (request) => {
    await client.post('/s/consents/changes', request);
  },
});
