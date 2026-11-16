import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SECTION_ROOTS,
  clearSectionMemory,
  isSectionRestore,
  readSectionMemory,
  rememberLocation,
  sectionLink,
  sectionOf,
} from '../../src/utils/sectionMemory.ts';

function fakeStorage() {
  const m = new Map();
  return {
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
  };
}

const APP = '6afb2e957f8423b23699956a';
const link = (section, pathname, memory, chatAppId = null) => sectionLink(section, { pathname, memory, chatAppId });

test('sections are recognised by their path', () => {
  assert.equal(sectionOf('/app/admin/apps'), 'apps');
  assert.equal(sectionOf(`/app/admin/apps/${APP}/settings`), 'apps');
  assert.equal(sectionOf('/app/admin/agents/abc/settings'), 'agents');
  assert.equal(sectionOf('/app/admin/server'), 'server');
  assert.equal(sectionOf('/app/admin/trust-safety/quarantine/x'), 'trustSafety');
  assert.equal(sectionOf('/app/chat'), null);
  assert.equal(sectionOf('/app/admin/appsfoo'), null);
});

test('the last place of each section is kept per user, with its query', () => {
  const s = fakeStorage();
  rememberLocation('u1', `/app/admin/apps/${APP}/settings`, '?tab=Appearance&section=chat', s);
  rememberLocation('u1', '/app/admin/server', '?tab=email', s);
  rememberLocation('u1', '/app/chat', '', s); // not a section: ignored
  rememberLocation('u2', '/app/admin/server', '?tab=ai', s);
  assert.deepEqual(readSectionMemory('u1', s), {
    apps: `/app/admin/apps/${APP}/settings?tab=Appearance&section=chat`,
    server: '/app/admin/server?tab=email',
  });
  assert.deepEqual(readSectionMemory('u2', s), { server: '/app/admin/server?tab=ai' });
  assert.deepEqual(readSectionMemory(null, s), {});
});

test('from another section the sidebar reopens the remembered place', () => {
  const memory = { apps: `/app/admin/apps/${APP}/settings?tab=Appearance`, agents: '/app/admin/agents/ag1/settings?tab=Flows', server: '/app/admin/server?tab=email', trustSafety: '/app/admin/trust-safety?tab=rules' };
  assert.equal(link('apps', '/app/chat', memory), memory.apps);
  assert.equal(link('agents', `/app/admin/apps/${APP}`, memory), memory.agents);
  assert.equal(link('server', '/app/admin/agents', memory), memory.server);
  assert.equal(link('trustSafety', '/app/help', memory), memory.trustSafety);
});

test('inside its own section the sidebar item goes to the list', () => {
  const memory = { apps: `/app/admin/apps/${APP}/settings?tab=Appearance` };
  assert.equal(link('apps', `/app/admin/apps/${APP}/settings`, memory), SECTION_ROOTS.apps);
  assert.equal(link('apps', '/app/admin/apps', memory), SECTION_ROOTS.apps);
});

test('nothing remembered, or a remembered path outside the section: the list', () => {
  assert.equal(link('agents', '/app/chat', {}), SECTION_ROOTS.agents);
  assert.equal(link('apps', '/app/chat', { apps: '/app/admin/server?tab=x' }), SECTION_ROOTS.apps);

});

test('Test Chats is reopened only when the chat context is already on that App', () => {
  const memory = { apps: `/app/admin/apps/${APP}/chats` };
  assert.equal(link('apps', '/app/admin/agents', memory, APP), memory.apps);
  assert.equal(link('apps', '/app/chat', memory, null), `/app/admin/apps/${APP}`);
  assert.equal(link('apps', '/app/chat', memory, 'other-app'), `/app/admin/apps/${APP}`);
});

test('sign-out clears every user in the tab, and nothing else', () => {
  const s = fakeStorage();
  rememberLocation('u1', '/app/admin/server', '?tab=email', s);
  rememberLocation('u2', '/app/admin/agents', '', s);
  s.setItem('other', 'kept');
  clearSectionMemory(s);
  assert.deepEqual(readSectionMemory('u1', s), {});
  assert.deepEqual(readSectionMemory('u2', s), {});
  assert.equal(s.getItem('other'), 'kept');
});

test('a broken stored value reads as nothing remembered', () => {
  const s = fakeStorage();
  s.setItem('sectionMemory-538:u1', '{not json');
  assert.deepEqual(readSectionMemory('u1', s), {});
});

test('restore state is recognised', () => {
  assert.equal(isSectionRestore({ sectionRestore: true }), true);
  assert.equal(isSectionRestore(null), false);
  assert.equal(isSectionRestore({ from: '/x' }), false);
});
