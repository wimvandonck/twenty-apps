import { restRecords } from 'src/twenty-client/rest-records';
import { linkedPaymentPatch, type PaidObject } from 'src/utils/linked-payment-patch.util';

// Brings a record that now points at a payment in line with that payment.
export const applyLinkedPayment = async (namePlural: PaidObject, recordId: string, paymentId: string | null | undefined) => {
  if (!paymentId) {
    return { updated: false };
  }

  const records = restRecords();
  const [payment, record] = await Promise.all([records.get('payments', paymentId), records.get(namePlural, recordId)]);

  if (!payment || !record) {
    return { updated: false };
  }

  const patch = linkedPaymentPatch(
    namePlural,
    { status: record.status, paymentStatus: record.paymentStatus },
    String(payment.status),
  );

  if (Object.keys(patch).length > 0) {
    await records.update(namePlural, recordId, patch);
  }

  return { updated: Object.keys(patch).length > 0 };
};
