// Legacy helper name remains for existing sign-up callers. New accounts now
// choose a project goal first instead of opening the Agents tutorial.
const STORAGE_KEY = 'agentsOnboarding-538';

export const AGENTS_ONBOARDING_PATH = '/app/admin/agents';

export function markAgentsOnboarding() {
  try {
    localStorage.setItem('newUser', 'true');
    localStorage.removeItem(STORAGE_KEY);
  } catch {
  }
}

export function isAgentsOnboarding(): boolean {
  try {
    return localStorage.getItem('newUser') === 'true';
  } catch {
    return false;
  }
}

export function clearAgentsOnboarding() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
  }
}
