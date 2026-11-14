import { paymentEffects } from 'src/utils/payment-effects.util';

export type PaidObject = 'registrations' | 'memberships' | 'orders';

// The fields to change on a record that was just linked to a payment, so it
// shows the payment's status at once instead of at its next change.
export const linkedPaymentPatch = (
  namePlural: PaidObject,
  record: { status?: unknown; paymentStatus?: unknown },
  paymentStatus: string,
): Record<string, string> => {
  const effects = paymentEffects(paymentStatus);

  if (namePlural === 'registrations') {
    return record.paymentStatus === effects.registrationPaymentStatus
      ? {}
      : { paymentStatus: effects.registrationPaymentStatus };
  }

  const change = namePlural === 'memberships' ? effects.membership : effects.order;

  return change && change.from.includes(String(record.status)) ? { status: change.to } : {};
};
