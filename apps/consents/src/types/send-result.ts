export type SendResult = { sent: true } | { sent: false; retry: boolean; reason: string };
