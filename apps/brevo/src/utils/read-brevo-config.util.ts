const value = (raw: string | undefined) => (raw && raw.trim() !== '' ? raw.trim() : null);

export const readBrevoConfig = (env: Record<string, string | undefined> = process.env) => ({
  apiKey: value(env.BREVO_API_KEY),
  webhookToken: value(env.BREVO_WEBHOOK_TOKEN),
  folderName: value(env.BREVO_FOLDER_NAME) ?? 'Twenty',
});
