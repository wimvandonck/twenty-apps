import { describe, expect, it } from 'vitest';

import { type PreferenceData } from 'src/types/preference-data';
import { applyPreferences } from 'src/utils/apply-preferences.util';
import { buildPreferenceGroups } from 'src/utils/build-preference-groups.util';
import { getPublicMessages } from 'src/utils/get-public-messages.util';
import { parsePostedForm } from 'src/utils/parse-posted-form.util';
import { renderPreferencesHtml } from 'src/utils/render-preferences-html.util';

const data: PreferenceData = {
  firstName: 'Ann',
  emailTypes: [
    { id: 'news', name: 'Nieuwsbrief', description: 'Elke maand', status: 'GRANTED' },
    { id: 'events', name: 'Uitnodigingen', description: '', status: 'WITHDRAWN' },
  ],
  lists: [
    { id: 'climate', name: 'Klimaat', requiredEmailTypeId: 'news', isMember: true },
    { id: 'walks', name: 'Wandelingen', requiredEmailTypeId: 'events', isMember: true },
    { id: 'misc', name: 'Varia <&>', requiredEmailTypeId: null, isMember: false },
    { id: 'orphan', name: 'Weg', requiredEmailTypeId: 'gone', isMember: false },
  ],
};

describe('buildPreferenceGroups', () => {
  it('puts lists under their email type and the rest apart', () => {
    const groups = buildPreferenceGroups(data);

    expect(groups.consents.map((group) => [group.emailType.id, group.isGranted, group.lists.map((list) => [list.id, list.isDisabled])])).toEqual([
      ['news', true, [['climate', false]]],
      ['events', false, [['walks', true]]],
    ]);
    expect(groups.otherLists.map((list) => list.id)).toEqual(['misc']);
  });
});

describe('applyPreferences', () => {
  it('returns nothing when nothing changed', () => {
    expect(applyPreferences(data, { grantedEmailTypeIds: ['news'], memberListIds: ['climate', 'walks'] })).toEqual({
      changes: [],
      memberships: [],
    });
  });

  it('grants, withdraws and changes memberships', () => {
    expect(applyPreferences(data, { grantedEmailTypeIds: ['events'], memberListIds: ['walks', 'misc'] })).toEqual({
      changes: [
        { emailTypeId: 'news', action: 'WITHDRAWN' },
        { emailTypeId: 'events', action: 'GRANTED' },
      ],
      memberships: [{ listId: 'misc', isMember: true }],
    });
  });

  it('leaves the membership of a list without consent unchanged, even when posted', () => {
    expect(applyPreferences(data, { grantedEmailTypeIds: ['news'], memberListIds: ['climate'] })).toEqual({
      changes: [],
      memberships: [],
    });
    expect(
      applyPreferences({ ...data, lists: [{ ...data.lists[1], isMember: false }] }, { grantedEmailTypeIds: ['news'], memberListIds: ['walks'] }),
    ).toEqual({ changes: [], memberships: [] });
  });

  it('ignores ids that are not on the page', () => {
    expect(applyPreferences(data, { grantedEmailTypeIds: ['news', 'hack'], memberListIds: ['climate', 'walks', 'orphan', 'x'] })).toEqual({
      changes: [],
      memberships: [],
    });
  });
});

describe('parsePostedForm', () => {
  it('reads form-encoded bodies in their different shapes', () => {
    const encoded = 'token=t1&consent=news&consent=events&list=misc';

    for (const event of [
      { body: encoded, isBase64Encoded: false },
      { body: Buffer.from(encoded).toString('base64'), isBase64Encoded: true },
      { body: null, rawBody: encoded, isBase64Encoded: false },
      { body: { token: 't1', consent: ['news', 'events'], list: 'misc' }, isBase64Encoded: false },
    ]) {
      expect(parsePostedForm(event)).toEqual({ token: 't1', consent: ['news', 'events'], list: ['misc'] });
    }
  });
});

describe('renderPreferencesHtml', () => {
  it('renders both sections, escaped, with only the first name', () => {
    const { messages } = getPublicMessages('nl', undefined);
    const html = renderPreferencesHtml({
      messages,
      locale: 'nl',
      organizationName: 'Vzw',
      firstName: 'Ann',
      groups: buildPreferenceGroups(data),
      token: 'tok"en',
      saved: true,
    });

    expect(html).toContain('Toestemming');
    expect(html).toContain('Onderwerpen');
    expect(html).toContain('Varia &lt;&amp;&gt;');
    expect(html).toContain('value="tok&quot;en"');
    expect(html).toContain('Je voorkeuren zijn bewaard.');
    expect(html).toMatch(/<input[^>]*name="consent"[^>]*value="news"[^>]*checked/);
    expect(html).toMatch(/<input[^>]*name="list"[^>]*value="walks"[^>]*disabled/);
  });
});
