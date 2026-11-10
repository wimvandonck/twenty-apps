export type SubmissionResult =
  | { ok: true }
  | { ok: false; status: 422 | 500; errors: string[] };
