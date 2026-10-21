import { expect, test } from '@playwright/test';
import {
  clearReturnPath,
  consumeReturnPath,
  isReturnablePath,
  peekReturnPath,
  rememberReturnPath,
} from '../../src/utils/returnPath';
import {
  classifyLookupFailure,
  isValidCallSlug,
  outcomeFromLookup,
} from '../../src/utils/scheduledCall';

// The "come back to the join link after login" bookkeeping and the mapping of
// the booking API's answers to screens. Pure logic, no browser: localStorage is
// stubbed with a Map.

const SLUG = 'abcdefghijklmnopqrstuv';

test.beforeEach(() => {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage;
});

test.describe('returnPath', () => {
  test('only scheduled-call join links may be parked (no open redirect)', () => {
    expect(isReturnablePath(`/call/${SLUG}`)).toBe(true);
    expect(isReturnablePath(`/call/${SLUG}/`)).toBe(true);
    expect(isReturnablePath(`/call/${SLUG}?x=1`)).toBe(true);
    for (const bad of [
      '/app/chat',
      '/call/short',
      `//evil.example/call/${SLUG}`,
      `https://evil.example/call/${SLUG}`,
      `/call/${SLUG}/../../admin`,
      `/call/${SLUG}#frag`,
      `/call/${SLUG}x!`,
      '',
      null,
      undefined,
    ]) {
      expect(isReturnablePath(bad as string)).toBe(false);
    }
    expect(rememberReturnPath('/app/admin')).toBe(false);
    expect(peekReturnPath()).toBeNull();
  });

  test('a parked path is returned once, then gone', () => {
    expect(rememberReturnPath(`/call/${SLUG}`)).toBe(true);
    expect(peekReturnPath()).toBe(`/call/${SLUG}`);
    expect(consumeReturnPath()).toBe(`/call/${SLUG}`);
    expect(consumeReturnPath()).toBeNull();
  });

  test('a newer join link replaces an older one', () => {
    const other = 'zyxwvutsrqponmlkjihgfe';
    rememberReturnPath(`/call/${SLUG}`);
    rememberReturnPath(`/call/${other}?a=1`);
    expect(consumeReturnPath()).toBe(`/call/${other}?a=1`);
  });

  test('a path older than an hour is stale and dropped', () => {
    const t0 = 1_000_000;
    rememberReturnPath(`/call/${SLUG}`, t0);
    expect(peekReturnPath(t0 + 59 * 60_000)).toBe(`/call/${SLUG}`);
    expect(consumeReturnPath(t0 + 61 * 60_000)).toBeNull();
    expect(peekReturnPath(t0)).toBeNull();
  });

  test('corrupt or tampered storage is ignored and cleared', () => {
    localStorage.setItem('returnPath-538', '{not json');
    expect(consumeReturnPath()).toBeNull();
    localStorage.setItem(
      'returnPath-538',
      JSON.stringify({ path: 'https://evil.example', at: Date.now() })
    );
    expect(consumeReturnPath()).toBeNull();
    expect(localStorage.getItem('returnPath-538')).toBeNull();
  });

  test('clearReturnPath forgets a parked path', () => {
    rememberReturnPath(`/call/${SLUG}`);
    clearReturnPath();
    expect(peekReturnPath()).toBeNull();
  });
});

test.describe('join link lookup outcomes', () => {
  const body = (status = 'scheduled') => ({
    scheduledCall: { slug: SLUG, status, title: 'Sync' },
    chat: { name: 'app_room', title: 'Room', type: 'group', jid: 'app_room@conference.x' },
  });

  test('a good call opens', () => {
    const outcome = outcomeFromLookup(body());
    expect(outcome.ok).toBe(true);
  });

  test('a cancelled call gets its own screen', () => {
    expect(outcomeFromLookup(body('cancelled'))).toEqual({ ok: false, reason: 'cancelled' });
  });

  test('404 is not-found, 403 is not-a-member, anything else is a retryable error', () => {
    expect(classifyLookupFailure(404)).toBe('not-found');
    expect(classifyLookupFailure(403)).toBe('not-a-member');
    expect(classifyLookupFailure(500)).toBe('error');
    expect(classifyLookupFailure(undefined)).toBe('error');
  });

  test('an answer without a chat is an error, not a crash', () => {
    expect(outcomeFromLookup({ scheduledCall: { slug: SLUG, status: 'scheduled' } })).toEqual({
      ok: false,
      reason: 'error',
    });
    expect(outcomeFromLookup(null)).toEqual({ ok: false, reason: 'error' });
  });

  test('slug shape', () => {
    expect(isValidCallSlug(SLUG)).toBe(true);
    expect(isValidCallSlug('short')).toBe(false);
    expect(isValidCallSlug('has/slash/has/slash/has/slash')).toBe(false);
  });
});
