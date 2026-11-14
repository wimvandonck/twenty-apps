import { describe, expect, it } from 'vitest';

import { signToken } from 'src/utils/sign-token.util';
import { verifyToken } from 'src/utils/verify-token.util';

const SECRET = 'test-secret';
const NOW = 1_800_000_000_000;

describe('tokens', () => {
  it('round-trips a confirmation token', () => {
    const payload = { kind: 'confirm' as const, submissionId: 'sub-1', expiresAt: NOW + 1000 };

    expect(verifyToken(signToken(payload, SECRET), SECRET, NOW)).toEqual(payload);
  });

  it('round-trips a preferences token', () => {
    const payload = { kind: 'preferences' as const, personId: 'person-1' };

    expect(verifyToken(signToken(payload, SECRET), SECRET, NOW)).toEqual(payload);
  });

  it('rejects a changed payload or signature', () => {
    const token = signToken({ kind: 'preferences', personId: 'person-1' }, SECRET);
    const [payload, signature] = token.split('.');
    const flip = (value: string) => (value[0] === 'A' ? 'B' : 'A') + value.slice(1);

    expect(verifyToken(`${flip(payload)}.${signature}`, SECRET, NOW)).toBeNull();
    expect(verifyToken(`${payload}.${flip(signature)}`, SECRET, NOW)).toBeNull();
  });

  it('rejects a token signed with another secret', () => {
    expect(verifyToken(signToken({ kind: 'preferences', personId: 'p' }, 'other'), SECRET, NOW)).toBeNull();
  });

  it('rejects an expired confirmation token', () => {
    const token = signToken({ kind: 'confirm', submissionId: 's', expiresAt: NOW - 1 }, SECRET);

    expect(verifyToken(token, SECRET, NOW)).toBeNull();
  });

  it('rejects malformed tokens', () => {
    expect(verifyToken('abc', SECRET, NOW)).toBeNull();
    expect(verifyToken('', SECRET, NOW)).toBeNull();
    expect(verifyToken('a.b.c', SECRET, NOW)).toBeNull();
  });

  it('rejects a signed payload of an unknown shape', () => {
    const token = signToken({ kind: 'other' } as never, SECRET);

    expect(verifyToken(token, SECRET, NOW)).toBeNull();
  });
});
