export type TokenPayload =
  | { kind: 'confirm'; submissionId: string; expiresAt: number }
  | { kind: 'preferences'; personId: string };
