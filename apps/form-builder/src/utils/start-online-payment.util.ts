import { type CheckoutApi } from 'src/types/checkout-api';
import { type FormPayment } from 'src/types/form-payment';
import { type SubmissionResult } from 'src/types/submission-result';

// The address to send the visitor to for paying online, or null. The
// submission is saved either way; a failing checkout leaves an open payment.
export const startOnlinePayment = async (
  api: CheckoutApi,
  payment: FormPayment | null,
  result: SubmissionResult,
  locale: string | undefined,
): Promise<string | null> => {
  if (!result.ok || !result.paymentId || payment?.checkout !== 'STRIPE') {
    return null;
  }

  try {
    return (await api.start({ paymentId: result.paymentId, ...(locale ? { locale } : {}) }))?.url ?? null;
  } catch (error) {
    console.error('Online payment could not be started', error);

    return null;
  }
};
