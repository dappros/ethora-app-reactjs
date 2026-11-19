import { useEffect } from 'react';

// Not for search engines, and no referrer (share addresses carry a token).
export function useNoIndexNoReferrer() {
  useEffect(() => {
    const metas = [
      Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex, nofollow' }),
      Object.assign(document.createElement('meta'), { name: 'referrer', content: 'no-referrer' }),
    ];
    metas.forEach((m) => document.head.appendChild(m));
    return () => metas.forEach((m) => m.remove());
  }, []);
}
