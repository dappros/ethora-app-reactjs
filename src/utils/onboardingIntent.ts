// The goal a new owner came to build. Picked on the start screen
// (/app/admin/start) or carried in from the website: `?intent=` on the sign-up
// link is explicit and skips the chooser, the entry page (`source_page`) only
// preselects a tile. Stored on the App (onboardingGoal) once one is created;
// App Home shows that goal's steps.
export type OnboardingIntent = 'website' | 'sdk' | 'messenger' | 'selfHost';

export const ONBOARDING_GOALS: OnboardingIntent[] = ['website', 'sdk', 'messenger', 'selfHost'];

const STORAGE_KEY = 'ethora:onboarding-intent';
const EXPLICIT_KEY = 'ethora:onboarding-intent-explicit';

function fromExplicit(value: string): OnboardingIntent | null {
  const v = value.toLowerCase();
  if (['ai', 'widget', 'website', 'ai-widget', 'assistant', 'chatbot'].includes(v)) return 'website';
  if (['self-hosted', 'selfhosted', 'self-host', 'selfhost', 'enterprise', 'on-prem'].includes(v)) return 'selfHost';
  // Calls are a switch inside the SDK goal, not a goal of their own.
  if (['chat', 'chat-sdk', 'sdk', 'mobile', 'calls', 'video', 'voice'].includes(v)) return 'sdk';
  if (['messenger', 'team', 'community', 'clients', 'white-label', 'whitelabel'].includes(v)) return 'messenger';
  return null;
}

// ?intent= only: what the visitor clicked on the website, so the start screen
// can skip its chooser.
export function explicitOnboardingIntent(params: URLSearchParams): OnboardingIntent | null {
  return fromExplicit(params.get('intent') || '');
}

export function inferOnboardingIntent(params: URLSearchParams): OnboardingIntent | null {
  const explicit = explicitOnboardingIntent(params);
  if (explicit) return explicit;

  const source = params.get('source_page') || params.get('first_page') || params.get('entry_page') || '';
  let path = source.toLowerCase();
  try { path = new URL(source, 'https://ethora.com').pathname.toLowerCase(); } catch { /* Keep the path. */ }
  if (/self-host|selfhost|\/get\//.test(path)) return 'selfHost';
  if (/widget|agent|chatbot|ai-bot|crawler|rag|\/ai-sdk\//.test(path)) return 'website';
  if (/messenger|white-label|whitelabel|private-practice|community|team-chat/.test(path)) return 'messenger';
  if (/video|voice|webrtc|live-streaming|chat-sdk|chat-component|mobile-app|react-native/.test(path)) return 'sdk';
  return null;
}

function read(key: string): string | null {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

export function getOnboardingIntent(): OnboardingIntent | null {
  const value = read(STORAGE_KEY);
  return (ONBOARDING_GOALS as string[]).includes(value || '') ? (value as OnboardingIntent) : null;
}

export function isOnboardingIntentExplicit(): boolean {
  return read(EXPLICIT_KEY) === '1' && getOnboardingIntent() !== null;
}

export function setOnboardingIntent(intent: OnboardingIntent | null, explicit = false) {
  try {
    if (intent) {
      sessionStorage.setItem(STORAGE_KEY, intent);
      if (explicit) sessionStorage.setItem(EXPLICIT_KEY, '1');
      else sessionStorage.removeItem(EXPLICIT_KEY);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(EXPLICIT_KEY);
    }
  } catch { /* Private browsing can disable storage. */ }
}

// "Yourbusiness assistant" from https://www.yourbusiness.com/about. Used until
// the crawl reads the real page title.
// `template` holds {name} ("{name} assistant", "Assistant {name}"); a
// template without it is appended after the name.
export function suggestAssistantName(website: string, template: string): string {
  try {
    const host = new URL(/^https?:\/\//i.test(website.trim()) ? website.trim() : `https://${website.trim()}`).hostname;
    const label = host.replace(/^www\./i, '').split('.')[0] || '';
    if (label.length < 2) return '';
    const name = `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
    return (template.includes('{name}') ? template.replace('{name}', name) : `${name} ${template}`).slice(0, 100);
  } catch {
    return '';
  }
}

// Accepts "yourbusiness.com" as well as a full URL; null when it is not one.
export function normaliseWebsite(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname.includes('.')) return null;
    return url.toString();
  } catch {
    return null;
  }
}
