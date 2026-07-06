import { useEffect, useState } from 'react';

// Matches the chat-component's mobile breakpoint (`window.innerWidth < 768`,
// i.e. `max-width: 767px`). Kept in one place so app-side config derived from
// it (room-list paddings, etc.) stays in sync with the component.
const MOBILE_QUERY = '(max-width: 767px)';

// Reactive mobile-viewport flag. Updates when the viewport crosses the
// breakpoint (resize, orientation change, devtools responsive toggle) so any
// config memoized on it re-evaluates instead of being frozen at load time.
export const useIsMobileView = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(MOBILE_QUERY).matches
      : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    // Re-sync in case the viewport changed between initial render and effect.
    setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
};
