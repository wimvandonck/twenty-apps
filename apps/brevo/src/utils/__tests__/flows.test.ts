import { describe, expect, it, vi } from 'vitest';

import { type BrevoDeps, type TwentyDeps } from 'src/types/brevo-deps';
import { handleUnsubscribe } from 'src/utils/handle-unsubscribe.util';
import { syncAll } from 'src/utils/sync-all.util';
import { syncMembership } from 'src/utils/sync-membership.util';
import { syncPerson } from 'src/utils/sync-person.util';

type Mocked<T> = { [K in keyof T]: ReturnType<typeof vi.fn> & T[K] };

const twenty = (overrides: Partial<TwentyDeps> = {}): Mocked<TwentyDeps> =>
  ({
    getPerson: vi.fn(async (id: string) => ({ id, email: 'ann@example.org', firstName: 'Ann', lastName: 'Peeters' })),
    getConsents: vi.fn(async () => [
      { emailTypeName: 'Nieuwsbrief', isGranted: true },
      { emailTypeName: 'Acties', isGranted: false },
    ]),
    getList: vi.fn(async (id: string) => ({ id, name: 'Klimaat', isSynced: true, brevoListId: null })),
    getSyncedLists: vi.fn(async () => [{ id: 'climate', name: 'Klimaat', isSynced: true, brevoListId: 12 }]),
    setBrevoListId: vi.fn(async () => undefined),
    getMemberPersonIds: vi.fn(async () => ['ann', 'bob']),
    findPersonIdByEmail: vi.fn(async () => 'ann'),
    withdrawAllConsents: vi.fn(async () => undefined),
    getListsByBrevoIds: vi.fn(async () => [{ id: 'climate', name: 'Klimaat', isSynced: true, brevoListId: 12 }]),
    removeMembership: vi.fn(async () => undefined),
    ...overrides,
  }) as never;

const brevo = (): Mocked<BrevoDeps> =>
  ({
    ensureBooleanAttribute: vi.fn(async () => undefined),
    createList: vi.fn(async () => 99),
    deleteList: vi.fn(async () => undefined),
    upsertContact: vi.fn(async () => undefined),
    removeFromList: vi.fn(async () => undefined),
  }) as never;

describe('syncPerson', () => {
  it('writes names and one attribute per consent to the contact', async () => {
    const b = brevo();

    await syncPerson(twenty(), b, 'ann', [5]);

    expect(b.ensureBooleanAttribute).toHaveBeenCalledWith('CONSENT_NIEUWSBRIEF');
    expect(b.upsertContact).toHaveBeenCalledWith({
      email: 'ann@example.org',
      attributes: { FIRSTNAME: 'Ann', LASTNAME: 'Peeters', CONSENT_NIEUWSBRIEF: true, CONSENT_ACTIES: false },
      listIds: [5],
      updateEnabled: true,
    });
  });

  it('skips people without an email', async () => {
    const b = brevo();

    await syncPerson(twenty({ getPerson: vi.fn(async () => ({ id: 'x', email: null, firstName: '', lastName: '' })) }), b, 'x');

    expect(b.upsertContact).not.toHaveBeenCalled();
  });
});

describe('syncMembership', () => {
  it('creates the Brevo list once and adds the member to it', async () => {
    const t = twenty();
    const b = brevo();

    await syncMembership(t, b, 'climate', 'ann', true);

    expect(b.createList).toHaveBeenCalledWith('Klimaat');
    expect(t.setBrevoListId).toHaveBeenCalledWith('climate', 99);
    expect(b.upsertContact.mock.calls[0][0]).toMatchObject({ listIds: [99] });
  });

  it('uses the Brevo list another run created at the same time, and deletes its own', async () => {
    const getList = vi
      .fn()
      .mockResolvedValueOnce({ id: 'climate', name: 'Klimaat', isSynced: true, brevoListId: null })
      .mockResolvedValue({ id: 'climate', name: 'Klimaat', isSynced: true, brevoListId: 77 });
    const t = twenty({ getList });
    const b = brevo();

    await syncMembership(t, b, 'climate', 'ann', true);

    expect(b.deleteList).toHaveBeenCalledWith(99);
    expect(b.upsertContact.mock.calls[0][0]).toMatchObject({ listIds: [77] });
  });

  it('removes a member that left, and ignores lists that are not synced', async () => {
    const t = twenty({ getList: vi.fn(async (id: string) => ({ id, name: 'Klimaat', isSynced: true, brevoListId: 12 })) });
    const b = brevo();

    await syncMembership(t, b, 'climate', 'ann', false);
    expect(b.removeFromList).toHaveBeenCalledWith(12, ['ann@example.org']);

    const internal = brevo();

    await syncMembership(twenty({ getList: vi.fn(async (id: string) => ({ id, name: 'AV', isSynced: false, brevoListId: null })) }), internal, 'agm', 'ann', true);
    expect(internal.upsertContact).not.toHaveBeenCalled();
  });
});

describe('syncAll', () => {
  it('puts every member of every synced list in Brevo', async () => {
    const b = brevo();

    expect(await syncAll(twenty(), b)).toEqual({ lists: 1, contacts: 2, failed: 0 });
    expect(b.upsertContact).toHaveBeenCalledTimes(2);
    expect(b.upsertContact.mock.calls[1][0]).toMatchObject({ listIds: [12] });
  });

  it('goes on after a contact Brevo refuses and counts it', async () => {
    const b = brevo();

    b.upsertContact.mockRejectedValueOnce(new Error('invalid email'));

    expect(await syncAll(twenty(), b)).toEqual({ lists: 1, contacts: 1, failed: 1 });
    expect(b.upsertContact).toHaveBeenCalledTimes(2);
  });
});

describe('handleUnsubscribe', () => {
  it('withdraws the consents and leaves the lists the person unsubscribed from', async () => {
    const t = twenty();

    expect(await handleUnsubscribe(t, { email: 'ann@example.org', listIds: [12] })).toEqual({ handled: true });
    expect(t.withdrawAllConsents).toHaveBeenCalledWith('ann');
    expect(t.removeMembership).toHaveBeenCalledWith('climate', 'ann');
  });

  it('ignores unknown addresses', async () => {
    const t = twenty({ findPersonIdByEmail: vi.fn(async () => null) });

    expect(await handleUnsubscribe(t, { email: 'nobody@example.org', listIds: [] })).toEqual({ handled: false });
    expect(t.withdrawAllConsents).not.toHaveBeenCalled();
  });
});
