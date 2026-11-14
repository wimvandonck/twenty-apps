import { type ConsentAction } from 'src/types/consent-action';
import { type ConsentSource } from 'src/types/consent-source';

export type ConsentChangeInput = {
  action: ConsentAction;
  source: ConsentSource;
  occurredAt?: string;
  shownText?: string;
  formName?: string;
  submissionId?: string;
  ipAddress?: string;
  userAgent?: string;
  language?: string;
  note?: string;
};
