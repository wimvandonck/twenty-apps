export type AppConfig = {
  signingSecret: string;
  brevoApiKey: string | null;
  senderEmail: string;
  senderName: string;
  organizationName: string;
  // The server's public address; public routes live under /s.
  publicBaseUrl: string;
};
