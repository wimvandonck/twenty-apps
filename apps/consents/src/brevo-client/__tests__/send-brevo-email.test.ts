import { afterEach, describe, expect, it, vi } from 'vitest';

import { sendBrevoEmail } from 'src/brevo-client/send-brevo-email';

const message = { to: { email: 'ann@example.org', name: 'Ann' }, subject: 'Bevestig', html: '<p>x</p>', text: 'x' };
const config = { apiKey: 'key-1', senderEmail: 'info@example.org', senderName: 'Vzw' };

const stubFetch = (implementation: () => Promise<Response>) => {
  const fetchMock = vi.fn(implementation);

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('sendBrevoEmail', () => {
  it('posts the message with the API key and reports success', async () => {
    const fetchMock = stubFetch(async () => new Response('{"messageId":"1"}', { status: 201 }));

    expect(await sendBrevoEmail(message, config)).toEqual({ sent: true });

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];

    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect((init.headers as Record<string, string>)['api-key']).toBe('key-1');
    expect(JSON.parse(init.body as string)).toEqual({
      sender: { email: 'info@example.org', name: 'Vzw' },
      to: [{ email: 'ann@example.org', name: 'Ann' }],
      subject: 'Bevestig',
      htmlContent: '<p>x</p>',
      textContent: 'x',
    });
  });

  it('asks for a retry on rate limits, server errors and network errors', async () => {
    stubFetch(async () => new Response('', { status: 429 }));
    expect(await sendBrevoEmail(message, config)).toMatchObject({ sent: false, retry: true });

    stubFetch(async () => new Response('', { status: 500 }));
    expect(await sendBrevoEmail(message, config)).toMatchObject({ sent: false, retry: true });

    stubFetch(async () => {
      throw new Error('offline');
    });
    expect(await sendBrevoEmail(message, config)).toMatchObject({ sent: false, retry: true });
  });

  it('does not retry a rejected request', async () => {
    stubFetch(async () => new Response('{"message":"bad sender"}', { status: 400 }));

    expect(await sendBrevoEmail(message, config)).toMatchObject({ sent: false, retry: false });
  });
});
