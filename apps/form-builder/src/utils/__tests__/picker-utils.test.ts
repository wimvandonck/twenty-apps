import { describe, expect, it, vi } from 'vitest';

import { type FormDefinition } from 'src/types/form-definition';
import { type FormPayment } from 'src/types/form-payment';
import { type FormPicker } from 'src/types/form-picker';
import { type PickerChoice } from 'src/types/picker-choice';
import { type RecordApi } from 'src/types/record-api';
import { buildPickerLines } from 'src/utils/build-picker-lines.util';
import { computeTotal } from 'src/utils/compute-total.util';
import { getPublicFormMessages } from 'src/utils/get-public-form-messages.util';
import { parseFormDefinition } from 'src/utils/parse-form-definition.util';
import { processSubmission } from 'src/utils/process-submission.util';
import { renderFormHtml } from 'src/utils/render-form-html.util';

import { DEFINITION } from './fixtures';

const { messages: MESSAGES } = getPublicFormMessages(undefined, undefined);

const TICKETS: FormPicker = {
  key: 'picker1',
  label: 'Tickets',
  required: true,
  single: false,
  maxQuantity: 10,
  source: { objectNamePlural: 'ticketTypes', priceFieldName: 'price', filters: [{ fieldName: 'isAvailable', value: true }] },
  line: {
    objectNamePlural: 'registrations',
    sourceJoinColumnName: 'ticketTypeId',
    quantityFieldName: null,
    unitPriceFieldName: 'amount',
    lineTotalFieldName: null,
    links: [{ joinColumnName: 'attendeeId', recordKey: 'person' }],
    copies: [{ sourceJoinColumnName: 'organizedEventId', lineJoinColumnName: 'organizedEventId' }],
  },
};
const PRODUCTS: FormPicker = {
  ...TICKETS,
  key: 'picker2',
  label: 'Products',
  required: false,
  source: { objectNamePlural: 'products', priceFieldName: 'price', filters: [] },
  line: {
    objectNamePlural: 'orderLines',
    sourceJoinColumnName: 'productId',
    quantityFieldName: 'quantity',
    unitPriceFieldName: 'unitPrice',
    lineTotalFieldName: 'lineTotal',
    links: [],
    copies: [],
  },
};
const choice = (id: string, label: string, euros: number | null, record: Record<string, unknown> = {}): PickerChoice => ({
  id,
  label,
  priceMicros: euros === null ? null : euros * 1_000_000,
  currencyCode: euros === null ? null : 'EUR',
  record,
});
const TICKET_CHOICES = [
  choice('standard', 'Standard', 15, { organizedEventId: 'event-1' }),
  choice('child', 'Child', null, { organizedEventId: 'event-1' }),
];
const eur = (euros: number) => ({ amountMicros: euros * 1_000_000, currencyCode: 'EUR' });

describe('buildPickerLines', () => {
  it('makes one record per unit when the line has no quantity field', () => {
    const result = buildPickerLines(TICKETS, TICKET_CHOICES, { standard: '2', child: '1' }, MESSAGES, 'EUR');

    expect(result.errors).toEqual([]);
    expect(result.totalMicros).toBe(30_000_000);
    expect(result.lines).toEqual([
      { ticketTypeId: 'standard', amount: eur(15), organizedEventId: 'event-1' },
      { ticketTypeId: 'standard', amount: eur(15), organizedEventId: 'event-1' },
      { ticketTypeId: 'child', amount: eur(0), organizedEventId: 'event-1' },
    ]);
  });

  it('makes one record per choice with quantity and totals when it has one', () => {
    const result = buildPickerLines(PRODUCTS, [choice('mug', 'Mug', 8)], { mug: '3' }, MESSAGES, 'EUR');

    expect(result.lines).toEqual([{ productId: 'mug', quantity: 3, unitPrice: eur(8), lineTotal: eur(24) }]);
    expect(result.totalMicros).toBe(24_000_000);
  });

  it('refuses unknown choices, bad or too large quantities and a required picker left empty', () => {
    expect(buildPickerLines(TICKETS, TICKET_CHOICES, { other: '1' }, MESSAGES, 'EUR').errors).toHaveLength(1);
    expect(buildPickerLines(TICKETS, TICKET_CHOICES, { standard: '-1' }, MESSAGES, 'EUR').errors).toHaveLength(1);
    expect(buildPickerLines(TICKETS, TICKET_CHOICES, { standard: '1.5' }, MESSAGES, 'EUR').errors).toHaveLength(1);
    expect(buildPickerLines(TICKETS, TICKET_CHOICES, { standard: '11' }, MESSAGES, 'EUR').errors).toHaveLength(1);
    expect(buildPickerLines(TICKETS, TICKET_CHOICES, {}, MESSAGES, 'EUR').errors).toEqual(['Tickets is required']);
    expect(buildPickerLines({ ...TICKETS, required: false }, TICKET_CHOICES, { standard: '0' }, MESSAGES, 'EUR').errors).toEqual([]);
  });

  it('takes one choice without a quantity in single mode', () => {
    const single = { ...TICKETS, single: true };

    expect(buildPickerLines(single, TICKET_CHOICES, { choice: 'standard' }, MESSAGES, 'EUR').lines).toHaveLength(1);
    expect(buildPickerLines(single, TICKET_CHOICES, { choice: 'nope' }, MESSAGES, 'EUR').errors).toHaveLength(1);
  });

  it('refuses a price in another currency', () => {
    const usd = [{ ...TICKET_CHOICES[0], currencyCode: 'USD' }];

    expect(buildPickerLines(TICKETS, usd, { standard: '1' }, MESSAGES, 'EUR').errors).toEqual([MESSAGES.misconfigured]);
  });
});

describe('computeTotal', () => {
  const payment: FormPayment = {
    currencyCode: 'EUR',
    amountFields: [{ recordKey: 'donation', fieldName: 'amount' }],
    totalFields: [],
    createPayment: true,
    checkout: 'NONE',
    payerRecordKey: 'person',
    paymentLinks: [],
  };

  it('adds the pickers and the amounts the visitor entered', () => {
    expect(computeTotal(payment, { donation: { amount: eur(20) } }, 30_000_000, MESSAGES)).toEqual({ totalMicros: 50_000_000, errors: [] });
  });

  it('refuses negative amounts and other currencies', () => {
    expect(computeTotal(payment, { donation: { amount: eur(-5) } }, 0, MESSAGES).errors).toHaveLength(1);
    expect(
      computeTotal(payment, { donation: { amount: { amountMicros: 1, currencyCode: 'USD' } } }, 0, MESSAGES).errors,
    ).toHaveLength(1);
  });
});

const SHOP: FormDefinition = {
  ...DEFINITION,
  records: [DEFINITION.records[0], { key: 'order', objectNameSingular: 'order', objectNamePlural: 'orders', label: 'Order', mode: 'CREATE', fields: [] }],
  links: [],
  pickers: [{ ...PRODUCTS, line: { ...PRODUCTS.line, links: [{ joinColumnName: 'orderId', recordKey: 'order' }] } }],
  payment: {
    currencyCode: 'EUR',
    amountFields: [],
    totalFields: [{ recordKey: 'order', fieldName: 'total' }],
    createPayment: true,
    checkout: 'NONE',
    payerRecordKey: 'person',
    paymentLinks: [{ recordKey: 'order', joinColumnName: 'paymentId' }],
  },
};
const VALUES = { person: { name: { firstName: 'Ada', lastName: 'Lovelace' }, emails: 'ada@example.com' } };

const createApi = (overrides: Partial<RecordApi> = {}): RecordApi => ({
  findIdByFilter: vi.fn(async () => null),
  create: vi.fn(async (objectNamePlural: string) => `${objectNamePlural}-id`),
  update: vi.fn(async () => undefined),
  remove: vi.fn(async () => undefined),
  ...overrides,
});

describe('a shop submission', () => {
  const choices = new Map([['picker2', [choice('mug', 'Mug', 8)]]]);

  it('writes the order with its total, the lines and an open payment linked to the order', async () => {
    const api = createApi();

    expect(
      await processSubmission(SHOP, VALUES, api, MESSAGES, {}, { pickerChoices: choices, picks: { picker2: { mug: '2' } } }),
    ).toEqual({ ok: true, paymentId: 'payments-id', totalMicros: 16_000_000 });
    expect(api.create).toHaveBeenCalledWith('orders', { total: eur(16) });
    expect(api.create).toHaveBeenCalledWith('orderLines', {
      productId: 'mug',
      quantity: 2,
      unitPrice: eur(8),
      lineTotal: eur(16),
      orderId: 'orders-id',
    });
    expect(api.create).toHaveBeenCalledWith('payments', {
      name: SHOP.title || 'Form payment',
      amount: eur(16),
      status: 'OPEN',
      payerId: 'people-id',
    });
    expect(api.update).toHaveBeenCalledWith('orders', 'orders-id', { paymentId: 'payments-id' });
  });

  it('creates no payment for a free submission', async () => {
    const api = createApi();
    const free = new Map([['picker2', [choice('flyer', 'Flyer', null)]]]);

    expect(await processSubmission(SHOP, VALUES, api, MESSAGES, {}, { pickerChoices: free, picks: { picker2: { flyer: '1' } } })).toEqual({
      ok: true,
    });
    expect(api.create).not.toHaveBeenCalledWith('payments', expect.anything());
  });

  it('removes the lines and the payment again when a write fails', async () => {
    const api = createApi({
      update: vi.fn(async () => Promise.reject(new Error('down'))),
    });

    expect(
      await processSubmission(SHOP, VALUES, api, MESSAGES, {}, { pickerChoices: choices, picks: { picker2: { mug: '1' } } }),
    ).toMatchObject({ ok: false, status: 500 });
    expect(api.remove).toHaveBeenCalledWith('payments', 'payments-id');
    expect(api.remove).toHaveBeenCalledWith('orderLines', 'orderLines-id');
  });
});

describe('pickers in the definition and on the page', () => {
  it('keeps valid pickers and payment settings', () => {
    const parsed = parseFormDefinition(SHOP);

    expect(parsed?.pickers).toEqual(SHOP.pickers);
    expect(parsed?.payment).toEqual(SHOP.payment);
  });

  it('rejects a picker that links to a record the form does not have', () => {
    const broken = { ...SHOP.pickers[0], line: { ...SHOP.pickers[0].line, links: [{ joinColumnName: 'orderId', recordKey: 'nope' }] } };

    expect(parseFormDefinition({ ...SHOP, pickers: [broken] })).toBeNull();
  });

  it('shows each choice with its price and a quantity, and the total', () => {
    const html = renderFormHtml(SHOP, MESSAGES, 'en', new Map([['picker2', [choice('mug', 'Mug <big>', 8)]]]));

    expect(html).toContain('Mug &lt;big&gt;');
    expect(html).toMatch(/<input[^>]*type="number"[^>]*data-picker="picker2"[^>]*data-choice="mug"[^>]*data-price="8000000"/);
    expect(html).toContain('data-total');
  });
});
