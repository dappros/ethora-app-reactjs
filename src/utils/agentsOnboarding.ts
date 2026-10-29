const STORAGE_KEY = 'agentsOnboarding-538';

export const AGENTS_ONBOARDING_PATH = '/app/admin/agents';

export function markAgentsOnboarding() {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
  }
}

export function isAgentsOnboarding(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
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
