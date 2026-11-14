export type AppConfig = {
  signingSecret: string;
  brevoApiKey: string | null;
  senderEmail: string;
  senderName: string;
  organizationName: string;
  // The public address of the app's routes, which live under /s.
  publicBaseUrl: string;
};
