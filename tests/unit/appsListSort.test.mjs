// The Apps list: newest first until the user picks another sorting, the pick
// remembered per user, and an address naming a sorting wins.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_APPS_SORT, readAppsSort, resolveAppsSort, saveAppsSort, showAppsSorting } from '../../src/utils/appsListSort.ts';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

test('newest first when nothing is chosen', () => {
  assert.deepEqual(DEFAULT_APPS_SORT, { orderBy: 'createdAt', order: 'desc' });
  assert.deepEqual(resolveAppsSort(new URLSearchParams(''), null), { orderBy: 'createdAt', order: 'desc', fromUrl: false });
});

test('a chosen sorting is remembered per user and used when the address names none', () => {
  const st = memoryStorage();
  saveAppsSort('u1', { orderBy: 'displayName', order: 'asc' }, st);
  assert.deepEqual(readAppsSort('u1', st), { orderBy: 'displayName', order: 'asc' });
  assert.equal(readAppsSort('u2', st), null);
  assert.deepEqual(resolveAppsSort(new URLSearchParams('page=2'), readAppsSort('u1', st)), { orderBy: 'displayName', order: 'asc', fromUrl: false });
});

test('an address naming a sorting wins; unknown values are ignored', () => {
  const remembered = { orderBy: 'displayName', order: 'asc' };
  assert.deepEqual(resolveAppsSort(new URLSearchParams('orderBy=totalChats&order=asc'), remembered), { orderBy: 'totalChats', order: 'asc', fromUrl: true });
  assert.deepEqual(resolveAppsSort(new URLSearchParams('orderBy=totalChats'), remembered), { orderBy: 'totalChats', order: 'desc', fromUrl: true });
  assert.deepEqual(resolveAppsSort(new URLSearchParams('orderBy=password'), remembered), { ...remembered, fromUrl: false });
  const st = memoryStorage();
  st.setItem('appsListSort:u1', '{"orderBy":"password","order":"asc"}');
  assert.equal(readAppsSort('u1', st), null);
  st.setItem('appsListSort:u1', 'not json');
  assert.equal(readAppsSort('u1', st), null);
  saveAppsSort('u1', { orderBy: 'nope', order: 'asc' }, st);
  assert.equal(st.getItem('appsListSort:u1'), 'not json');
});

test('no user or no storage: nothing remembered, nothing thrown', () => {
  assert.equal(readAppsSort(null, memoryStorage()), null);
  assert.equal(readAppsSort('u1', null), null);
  const throwing = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
  assert.equal(readAppsSort('u1', throwing), null);
  saveAppsSort('u1', { orderBy: 'createdAt', order: 'desc' }, throwing);
});

test('every account gets the sorting control once its list has more than one App', () => {
  assert.equal(showAppsSorting({ listTotal: 2 }), true);
  assert.equal(showAppsSorting({ listTotal: 40 }), true);
});

test('the control stays hidden for one App or none, and while the count is loading', () => {
  assert.equal(showAppsSorting({ listTotal: 1 }), false);
  assert.equal(showAppsSorting({ listTotal: 0 }), false);
  assert.equal(showAppsSorting({ listTotal: null }), false);
});

test('a search or a platform admin always shows it', () => {
  assert.equal(showAppsSorting({ listTotal: 1, searching: true }), true);
  assert.equal(showAppsSorting({ listTotal: 0, isSuperAdmin: true }), true);
  assert.equal(showAppsSorting({ listTotal: null, isSuperAdmin: true }), true);
});
