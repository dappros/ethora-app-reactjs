// Each main sidebar section remembers where the operator last was (the App
// and its tab, the agent and its panel, the Server or T&S hub tab), so
// switching sections and back does not lose the context. Kept per signed-in
// user and per browser tab (sessionStorage), and cleared on sign-out, so a
// fresh session starts at the section's list.
//
// Pure helpers here; the hook in hooks/useSectionMemory.ts records the
// location and AppMenu uses sectionLink() for the sidebar targets.

export type SectionId = 'apps' | 'agents' | 'server' | 'trustSafety';

export const SECTION_ROOTS: Record<SectionId, string> = {
  apps: '/app/admin/apps',
  agents: '/app/admin/agents',
  server: '/app/admin/server',
  trustSafety: '/app/admin/trust-safety',
};

const KEY_PREFIX = 'sectionMemory-538:';

/** Router state of a sidebar restore; a page that cannot load sends it to the list. */
export const RESTORE_STATE = { sectionRestore: true } as const;
export const isSectionRestore = (state: unknown): boolean => Boolean((state as { sectionRestore?: boolean } | null)?.sectionRestore);

export function sectionOf(pathname: string): SectionId | null {
  for (const [id, root] of Object.entries(SECTION_ROOTS) as [SectionId, string][]) {
    if (pathname === root || pathname.startsWith(`${root}/`)) return id;
  }
  return null;
}

const APP_PATH = /^\/app\/admin\/apps\/([^/?]+)(\/[^?]*)?$/;
const AGENT_PATH = /^\/app\/admin\/agents\/([^/?]+)\/settings$/;

/** The App id of an /app/admin/apps/<id>/... path, else null. */
export function appIdOf(pathname: string): string | null {
  return APP_PATH.exec(pathname)?.[1] || null;
}

/** The agent id of an /app/admin/agents/<id>/settings path, else null. */
export function agentIdOf(pathname: string): string | null {
  return AGENT_PATH.exec(pathname)?.[1] || null;
}

export type SectionMemory = Partial<Record<SectionId, string>>;

function storageKey(userId: string) {
  return `${KEY_PREFIX}${userId}`;
}

export function readSectionMemory(userId: string | null | undefined, storage: Storage | null = safeSession()): SectionMemory {
  if (!userId || !storage) return {};
  try {
    const raw = storage.getItem(storageKey(userId));
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/** Remembers `pathname + search` for the section it belongs to (no-op outside one). */
export function rememberLocation(
  userId: string | null | undefined,
  pathname: string,
  search: string,
  storage: Storage | null = safeSession()
): void {
  const section = sectionOf(pathname);
  if (!userId || !storage || !section) return;
  const next = { ...readSectionMemory(userId, storage), [section]: `${pathname}${search || ''}` };
  try {
    storage.setItem(storageKey(userId), JSON.stringify(next));
  } catch {
    // Storage full or disabled: the sidebar simply opens the lists.
  }
}

/** Forgets every user's section memory in this tab (on sign-out). */
export function clearSectionMemory(storage: Storage | null = safeSession()): void {
  if (!storage) return;
  try {
    for (let i = storage.length - 1; i >= 0; i--) {
      const k = storage.key(i);
      if (k && k.startsWith(KEY_PREFIX)) storage.removeItem(k);
    }
  } catch {
    // Nothing to clear.
  }
}

export interface SectionLinkContext {
  /** The current location's pathname. */
  pathname: string;
  memory: SectionMemory;
  /** The App the chat context is on now (store chatAppId). */
  chatAppId: string | null;
}

/**
 * Where a sidebar item leads. Inside its own section: the section's list.
 * From another section: the remembered place. Test Chats is restored only
 * when the chat context is already on that App (opening it otherwise
 * switches the chat context); else the App's Home. An App or agent that no
 * longer exists or is forbidden is handled where it loads: the page sends
 * a restored visit back to the list (RESTORE_STATE).
 */
export function sectionLink(section: SectionId, ctx: SectionLinkContext): string {
  const root = SECTION_ROOTS[section];
  if (sectionOf(ctx.pathname) === section) return root;
  const remembered = ctx.memory[section];
  if (!remembered || !remembered.startsWith(root)) return root;
  const [path] = remembered.split('?');
  if (section === 'apps') {
    const appId = appIdOf(path);
    if (path !== root && !appId) return root;
    if (appId && /\/chats\/?$/.test(path) && ctx.chatAppId !== appId) return `${root}/${appId}`;
  }
  return remembered;
}

function safeSession(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    return null;
  }
}
