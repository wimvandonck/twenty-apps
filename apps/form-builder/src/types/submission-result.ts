export type SubmissionResult =
  // paymentId and totalMicros when the submission created a payment.
  | { ok: true; paymentId?: string; totalMicros?: number }
  | { ok: false; status: 422 | 500; errors: string[] };
