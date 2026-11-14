import { describe, expect, it } from 'vitest';

import { requestContextFrom } from 'src/utils/request-context-from.util';

describe('requestContextFrom', () => {
  it('takes the first forwarded address and the user agent', () => {
    expect(requestContextFrom({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1', 'user-agent': 'UA' })).toEqual({
      ipAddress: '1.2.3.4',
      userAgent: 'UA',
    });
  });

  it('leaves out what is missing and cuts long values', () => {
    expect(requestContextFrom({})).toEqual({});
    expect(requestContextFrom({ 'user-agent': 'x'.repeat(600) }).userAgent).toHaveLength(500);
  });
});
