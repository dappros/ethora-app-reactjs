export type ProjectSection = 'assistant' | 'widget' | 'users' | 'statistics' | 'settings';

type RecentPage = { section: ProjectSection; search?: string };

const sections = new Set<ProjectSection>(['assistant', 'widget', 'users', 'statistics', 'settings']);
const key = (appId: string) => `ethora:project-recent:${appId}`;

export function saveRecentProjectPage(appId: string, section: ProjectSection, search = '') {
  if (!appId || !sections.has(section)) return;
  try {
    localStorage.setItem(key(appId), JSON.stringify({
      section,
      search: (section === 'settings' || section === 'widget') && search.length < 200 ? search : '',
    } satisfies RecentPage));
  } catch { /* Navigation still works when browser storage is unavailable. */ }
}

export function readRecentProjectPage(appId: string): RecentPage | null {
  try {
    const value = JSON.parse(localStorage.getItem(key(appId)) || 'null') as RecentPage | { section: 'chat' } | null;
    if (value?.section === 'chat') return { section: 'settings', search: '?tab=Chats' };
    if (!value || !sections.has(value.section)) return null;
    return { section: value.section, search: typeof value.search === 'string' && value.search.length < 200 ? value.search : '' };
  } catch { return null; }
}

export function recentProjectUrl(appId: string, page: RecentPage): string {
  const search = page.section === 'settings' || page.section === 'widget' ? page.search || '' : '';
  return `/app/admin/apps/${appId}/${page.section}${search}`;
}
