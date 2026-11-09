export const HANDOFF_COOKIE = 'ethora_handoff';

function clearHandoffCookie() {
  const expire = `${HANDOFF_COOKIE}=; path=/; max-age=0; secure; samesite=lax`;
  document.cookie = expire;
  const labels = window.location.hostname.split('.');
  for (let i = 0; i < labels.length - 1; i += 1) {
    document.cookie = `${expire}; domain=.${labels.slice(i).join('.')}`;
  }
}

export function takeHandoffCode(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${HANDOFF_COOKIE}=`));
  if (!match) return '';
  clearHandoffCookie();
  try {
    return decodeURIComponent(match.slice(HANDOFF_COOKIE.length + 1));
  } catch {
    return '';
  }
}
