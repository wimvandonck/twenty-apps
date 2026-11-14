import { type EmailMessage } from 'src/types/email-message';
import { type SendResult } from 'src/types/send-result';

const BREVO_SEND_URL = 'https://api.brevo.com/v3/smtp/email';

export type BrevoConfig = { apiKey: string; senderEmail: string; senderName: string };

// Sends one transactional email. Rate limits, server errors and network
// errors are worth retrying later; other rejections are not.
export const sendBrevoEmail = async (message: EmailMessage, config: BrevoConfig): Promise<SendResult> => {
  try {
    const response = await fetch(BREVO_SEND_URL, {
      method: 'POST',
      headers: { 'api-key': config.apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { email: config.senderEmail, name: config.senderName },
        to: [message.to],
        subject: message.subject,
        htmlContent: message.html,
        textContent: message.text,
      }),
    });

    if (response.ok) {
      return { sent: true };
    }

    const detail = await response.text().catch(() => '');

    return {
      sent: false,
      retry: response.status === 429 || response.status >= 500,
      reason: `Brevo answered ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`,
    };
  } catch (error) {
    return { sent: false, retry: true, reason: error instanceof Error ? error.message : 'Network error' };
  }
};
