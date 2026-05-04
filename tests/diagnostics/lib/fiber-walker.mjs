// React fiber walking helpers. In production builds we don't have React
// DevTools available, so to inspect the redux store we walk fibers
// directly from a known DOM node up to the root, then BFS down looking
// for any object with a `getState` method.
//
// All functions in this module are designed to be passed AS strings into
// `page.evaluate(fn)` -- meaning they execute in the browser, not in
// Node. They do not import anything; they rely only on browser globals
// (document, Object).

// Export a stringified self-contained finder so callers can drop it into
// page.evaluate without import gymnastics. Returns the redux store object
// (with `dispatch`, `getState`, `subscribe`) for the chat-component, or
// null. Pure: no side effects.
export const findChatStoreSrc = `function findChatStore() {
  const root = document.querySelector('[id=root]') || document.body;
  const all = Array.from(root.querySelectorAll('*'));
  const start = all.find(el => Object.keys(el).some(k => k.startsWith('__reactFiber')));
  if (!start) return null;
  const fiberKey = Object.keys(start).find(k => k.startsWith('__reactFiber'));
  let fiber = start[fiberKey];
  while (fiber && fiber.return) fiber = fiber.return;
  const stack = [fiber];
  while (stack.length) {
    const f = stack.pop();
    if (!f) continue;
    const s = f.memoizedProps?.store || f.memoizedProps?.value?.store;
    if (s && typeof s.dispatch === 'function' && typeof s.getState === 'function') {
      try {
        const state = s.getState();
        if (state && state.chatSettingStore) return s;
      } catch {}
    }
    if (f.child) stack.push(f.child);
    if (f.sibling) stack.push(f.sibling);
  }
  return null;
}`;

// Force the chat-component's verbose logger on. Without this, all the
// `ethoraLogger.log` / `.info` / `.debug` calls are silently no-op'd and
// you can't see init-policy decisions. Returns 'enabled', 'no-store', or
// 'err: ...'. Use after the chat-component has mounted (give it ~1-2s).
export async function enableChatVerboseLogging(page) {
  return await page.evaluate(`(() => {
    try {
      ${findChatStoreSrc}
      const store = findChatStore();
      if (!store) return 'no-store';
      const cur = store.getState().chatSettingStore.config || {};
      store.dispatch({
        type: 'chatSettingStore/setConfig',
        payload: { ...cur, useStoreConsoleEnabled: true },
      });
      return 'enabled';
    } catch (e) { return 'err: ' + String(e); }
  })()`);
}

// Snapshot a redacted view of the chat-component's chatSettingStore.
// Useful for "is the user populated?", "is initBeforeLoad still on?",
// "did userLogin make it into the config?" type questions.
export async function snapshotChatStore(page) {
  return await page.evaluate(`(() => {
    try {
      ${findChatStoreSrc}
      const store = findChatStore();
      if (!store) return { error: 'store not found' };
      const s = store.getState();
      const css = s.chatSettingStore || {};
      return {
        keys: Object.keys(s),
        chatSettingStoreKeys: Object.keys(css),
        user: css.user ? {
          xmppUsername: css.user.xmppUsername || '',
          xmppPassword: css.user.xmppPassword ? '(present)' : '(empty)',
          token: css.user.token ? '(present)' : '(empty)',
          firstName: css.user.firstName,
          lastName: css.user.lastName,
        } : null,
        config: css.config ? {
          initBeforeLoad: css.config.initBeforeLoad,
          baseUrl: css.config.baseUrl,
          xmppSettings: css.config.xmppSettings,
          customAppToken: css.config.customAppToken ? '(present)' : '(empty)',
          userLogin: css.config.userLogin ? {
            enabled: css.config.userLogin.enabled,
            user_xmppUsername: css.config.userLogin.user?.xmppUsername || '',
            user_xmppPassword: css.config.userLogin.user?.xmppPassword ? '(present)' : '(empty)',
          } : null,
          jwtLogin: css.config.jwtLogin ? {
            enabled: css.config.jwtLogin.enabled,
            tokenLen: (css.config.jwtLogin.token || '').length,
          } : null,
        } : null,
      };
    } catch (e) { return { error: String(e) }; }
  })()`);
}
