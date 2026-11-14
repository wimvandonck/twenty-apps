import { type BrevoDeps } from 'src/types/brevo-deps';

const BREVO_API = 'https://api.brevo.com/v3';

// Brevo's contacts API with an API key. Attributes and the folder are looked
// up once per run.
export const createBrevoDeps = (apiKey: string, folderName: string): BrevoDeps => {
  const known = new Set<string>();
  let folderId: number | null = null;
  const call = async (method: string, path: string, body?: unknown) => {
    const response = await fetch(`${BREVO_API}${path}`, {
      method,
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    return { ok: response.ok, status: response.status, json };
  };
  const fail = (what: string, result: { status: number; json: Record<string, unknown> }) =>
    new Error(`Brevo ${what} failed (${result.status}): ${String(result.json.message ?? '')}`);

  return {
    ensureBooleanAttribute: async (name) => {
      if (known.has(name)) {
        return;
      }

      const result = await call('POST', `/contacts/attributes/normal/${encodeURIComponent(name)}`, { type: 'boolean' });

      // 400 means the attribute exists already.
      if (!result.ok && result.status !== 400) {
        throw fail(`creating attribute ${name}`, result);
      }

      known.add(name);
    },
    createList: async (name) => {
      if (folderId === null) {
        const folders = await call('GET', '/contacts/folders?limit=50&offset=0');
        const existing = ((folders.json.folders as Array<{ id: number; name: string }> | undefined) ?? []).find(
          (folder) => folder.name === folderName,
        );

        if (existing) {
          folderId = existing.id;
        } else {
          const created = await call('POST', '/contacts/folders', { name: folderName });

          if (!created.ok) {
            throw fail('creating the folder', created);
          }

          folderId = created.json.id as number;
        }
      }

      const list = await call('POST', '/contacts/lists', { name, folderId });

      if (!list.ok) {
        throw fail(`creating list ${name}`, list);
      }

      return list.json.id as number;
    },
    deleteList: async (brevoListId) => {
      const result = await call('DELETE', `/contacts/lists/${brevoListId}`);

      if (!result.ok && result.status !== 404) {
        throw fail(`deleting list ${brevoListId}`, result);
      }
    },
    upsertContact: async (body) => {
      const result = await call('POST', '/contacts', body);

      if (!result.ok) {
        throw fail('saving a contact', result);
      }
    },
    removeFromList: async (brevoListId, emails) => {
      const result = await call('POST', `/contacts/lists/${brevoListId}/contacts/remove`, { emails });

      // 400 means the contacts were not on the list.
      if (!result.ok && result.status !== 400) {
        throw fail('removing contacts from a list', result);
      }
    },
  };
};
