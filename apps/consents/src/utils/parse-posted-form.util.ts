export type PostedForm = { token: string; consent: string[]; list: string[] };

type FormEvent = { body: unknown; rawBody?: string; isBase64Encoded: boolean };

const toList = (value: unknown): string[] =>
  (Array.isArray(value) ? value : value === undefined || value === null ? [] : [value]).filter(
    (entry): entry is string => typeof entry === 'string',
  );

// The fields of a posted HTML form, whether Twenty hands the body over as
// text, base64 or an already parsed object.
export const parsePostedForm = (event: FormEvent): PostedForm => {
  if (typeof event.body === 'object' && event.body !== null) {
    const body = event.body as Record<string, unknown>;

    return { token: toList(body.token)[0] ?? '', consent: toList(body.consent), list: toList(body.list) };
  }

  const raw =
    typeof event.body === 'string'
      ? event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString('utf8')
        : event.body
      : (event.rawBody ?? '');
  const params = new URLSearchParams(raw);

  return { token: params.get('token') ?? '', consent: params.getAll('consent'), list: params.getAll('list') };
};
