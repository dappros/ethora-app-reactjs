export type OnboardingIntent = 'website' | 'chat' | 'calls' | 'selfHost';

const STORAGE_KEY = 'ethora:onboarding-intent';

export function inferOnboardingIntent(params: URLSearchParams): OnboardingIntent | null {
  const explicit = (params.get('intent') || '').toLowerCase();
  if (['ai', 'widget', 'website', 'ai-widget', 'assistant'].includes(explicit)) return 'website';
  if (['self-hosted', 'selfhosted', 'self-host', 'selfhost'].includes(explicit)) return 'selfHost';
  if (['chat', 'chat-sdk', 'sdk', 'mobile'].includes(explicit)) return 'chat';
  if (['calls', 'video', 'voice'].includes(explicit)) return 'calls';

  const source = params.get('source_page') || params.get('first_page') || params.get('entry_page') || '';
  let path = source.toLowerCase();
  try { path = new URL(source, 'https://ethora.com').pathname.toLowerCase(); } catch { /* Keep the path. */ }
  if (/self-host|selfhost/.test(path)) return 'selfHost';
  if (/widget|agent|chatbot|ai-bot|crawler|rag|\/ai-sdk\//.test(path)) return 'website';
  if (/video|voice|webrtc|live-streaming/.test(path)) return 'calls';
  if (/chat-sdk|chat-component|mobile-app|react-native/.test(path)) return 'chat';
  return null;
}

export function getOnboardingIntent(): OnboardingIntent | null {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return value === 'website' || value === 'chat' || value === 'calls' || value === 'selfHost' ? value : null;
  } catch { return null; }
}

export function setOnboardingIntent(intent: OnboardingIntent | null) {
  try {
    if (intent) sessionStorage.setItem(STORAGE_KEY, intent);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* Private browsing can disable storage. */ }
}
