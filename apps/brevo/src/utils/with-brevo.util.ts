import { createBrevoDeps } from 'src/brevo-client/create-brevo-deps';
import { createTwentyDeps } from 'src/twenty-client/create-twenty-deps';
import { type BrevoDeps, type TwentyDeps } from 'src/types/brevo-deps';
import { readBrevoConfig } from 'src/utils/read-brevo-config.util';

// Runs a sync step when a Brevo key is set; does nothing otherwise.
export const withBrevo = async <T>(step: (twenty: TwentyDeps, brevo: BrevoDeps) => Promise<T>): Promise<T | { skipped: string }> => {
  const config = readBrevoConfig();

  if (!config.apiKey) {
    return { skipped: 'no Brevo API key' };
  }

  return step(createTwentyDeps(), createBrevoDeps(config.apiKey, config.folderName));
};
