import { createHmac, timingSafeEqual } from 'node:crypto';

import { type TokenPayload } from 'src/types/token-payload';

const isString = (value: unknown): value is string => typeof value === 'string' && value !== '';

const toPayload = (value: unknown): TokenPayload | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (candidate.kind === 'confirm' && isString(candidate.submissionId) && typeof candidate.expiresAt === 'number') {
    return { kind: 'confirm', submissionId: candidate.submissionId, expiresAt: candidate.expiresAt };
  }

  if (candidate.kind === 'preferences' && isString(candidate.personId)) {
    return { kind: 'preferences', personId: candidate.personId };
  }

  return null;
};

// The payload of a token signed with this secret, or null when the token is
// malformed, tampered with or expired.
export const verifyToken = (token: string, secret: string, now: number): TokenPayload | null => {
  const parts = token.split('.');

  if (parts.length !== 2 || parts[0] === '' || parts[1] === '') {
    return null;
  }

  const [encoded, signature] = parts;
  const expected = createHmac('sha256', secret).update(encoded).digest();
  const actual = Buffer.from(signature, 'base64url');

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }

  let payload: TokenPayload | null;

  try {
    payload = toPayload(JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')));
  } catch {
    return null;
  }

  if (payload?.kind === 'confirm' && payload.expiresAt < now) {
    return null;
  }

  return payload;
};
