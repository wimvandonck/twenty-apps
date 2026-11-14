import { type RequestContext } from 'src/types/request-context';

// The visitor's address and browser from forwarded request headers.
export const requestContextFrom = (headers: Record<string, string | undefined> | undefined): RequestContext => {
  const ipAddress = headers?.['x-forwarded-for']?.split(',')[0]?.trim();
  const userAgent = headers?.['user-agent']?.trim().slice(0, 500);

  return {
    ...(ipAddress ? { ipAddress } : {}),
    ...(userAgent ? { userAgent } : {}),
  };
};
