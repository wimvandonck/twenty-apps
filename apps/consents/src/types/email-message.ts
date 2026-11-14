export type EmailMessage = {
  to: { email: string; name?: string };
  subject: string;
  html: string;
  text: string;
};
