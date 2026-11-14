import { createHmac } from 'node:crypto';

import { type TokenPayload } from 'src/types/token-payload';

// base64url(JSON payload) + "." + base64url(HMAC-SHA256 of that first part).
export const signToken = (payload: TokenPayload, secret: string): string => {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url');

  return `${encoded}.${signature}`;
};
