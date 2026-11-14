import { describe, expect, it } from 'vitest';

import { type FormRecord } from 'src/types/form-record';
import { type ObjectMetadata } from 'src/types/object-metadata';
import { suggestPayment } from 'src/utils/suggest-payment.util';
import { suggestPicker } from 'src/utils/suggest-picker.util';

import { field, PERSON } from './fixtures';

const object = (nameSingular: string, namePlural: string, fields: ObjectMetadata['fields']): ObjectMetadata => ({
  nameSingular,
  namePlural,
  labelSingular: nameSingular,
  labelPlural: namePlural,
  isSelectable: true,
  fields,
});
const manyToOne = (name: string, target: string) =>
  field({ name, type: 'RELATION', relationType: 'MANY_TO_ONE', joinColumnName: `${name}Id`, relationTargetObjectNameSingular: target });

const TICKET_TYPE = object('ticketType', 'ticketTypes', [
  field({ name: 'name' }),
  field({ name: 'price', type: 'CURRENCY' }),
  field({ name: 'isAvailable', type: 'BOOLEAN' }),
  manyToOne('organizedEvent', 'organizedEvent'),
]);
const REGISTRATION = object('registration', 'registrations', [
  field({ name: 'name' }),
  field({ name: 'amount', type: 'CURRENCY' }),
  manyToOne('ticketType', 'ticketType'),
  manyToOne('organizedEvent', 'organizedEvent'),
  manyToOne('attendee', 'person'),
  manyToOne('payment', 'payment'),
]);
const PRODUCT = object('product', 'products', [field({ name: 'price', type: 'CURRENCY' }), field({ name: 'isActive', type: 'BOOLEAN' })]);
const ORDER_LINE = object('orderLine', 'orderLines', [
  field({ name: 'quantity', type: 'NUMBER' }),
  field({ name: 'unitPrice', type: 'CURRENCY' }),
  field({ name: 'lineTotal', type: 'CURRENCY' }),
  manyToOne('product', 'product'),
  manyToOne('order', 'order'),
]);
const ORDER = object('order', 'orders', [field({ name: 'total', type: 'CURRENCY' }), manyToOne('payment', 'payment'), manyToOne('customer', 'person')]);
const OBJECTS = [PERSON, TICKET_TYPE, REGISTRATION, PRODUCT, ORDER_LINE, ORDER];
const record = (key: string, objectNameSingular: string, objectNamePlural: string): FormRecord => ({
  key,
  objectNameSingular,
  objectNamePlural,
  label: key,
  mode: 'CREATE',
  fields: [],
});

describe('suggestPicker', () => {
  it('works out tickets: one registration per ticket, for the person, with the event copied', () => {
    expect(suggestPicker('picker1', TICKET_TYPE, REGISTRATION, [record('person', 'person', 'people')])).toEqual({
      key: 'picker1',
      label: 'ticketTypes',
      required: false,
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
    });
  });

  it('works out products: one order line per product with quantity and totals, in the order', () => {
    const picker = suggestPicker('picker1', PRODUCT, ORDER_LINE, [record('order', 'order', 'orders')]);

    expect(picker?.source.filters).toEqual([{ fieldName: 'isActive', value: true }]);
    expect(picker?.line).toMatchObject({
      sourceJoinColumnName: 'productId',
      quantityFieldName: 'quantity',
      unitPriceFieldName: 'unitPrice',
      lineTotalFieldName: 'lineTotal',
      links: [{ joinColumnName: 'orderId', recordKey: 'order' }],
    });
  });

  it('gives null when the line cannot point at the choice', () => {
    expect(suggestPicker('picker1', PRODUCT, REGISTRATION, [])).toBeNull();
  });
});

describe('suggestPayment', () => {
  it('fills the order total, lets the person pay and links whatever can point at a payment', () => {
    const records = [record('person', 'person', 'people'), record('order', 'order', 'orders')];
    const picker = suggestPicker('picker1', TICKET_TYPE, REGISTRATION, records);

    expect(suggestPayment(records, picker ? [picker] : [], OBJECTS)).toEqual({
      currencyCode: 'EUR',
      amountFields: [],
      totalFields: [{ recordKey: 'order', fieldName: 'total' }],
      createPayment: true,
    checkout: 'NONE',
      payerRecordKey: 'person',
      paymentLinks: [
        { recordKey: 'order', joinColumnName: 'paymentId' },
        { pickerKey: 'picker1', joinColumnName: 'paymentId' },
      ],
    });
  });
  it('leaves out records matched to an existing one', () => {
    const records = [record('person', 'person', 'people'), { ...record('order', 'order', 'orders'), mode: 'UPSERT' as const }];
    const suggested = suggestPayment(records, [], OBJECTS);

    expect(suggested.totalFields).toEqual([]);
    expect(suggested.paymentLinks).toEqual([]);
    expect(suggested.payerRecordKey).toBe('person');
  });
});
