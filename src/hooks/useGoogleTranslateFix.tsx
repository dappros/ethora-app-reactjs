import { useEffect, useState, useRef } from 'react';

export function useGoogleTranslateFix() {
  const [key, setKey] = useState(0);
  const observerRef = useRef<MutationObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    observerRef.current = new MutationObserver((mutations) => {
      const isGoogleTranslateChange = mutations.some((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          return (
            target.hasAttribute('data-tts-active') ||
            target.classList.contains('goog-te-banner-frame') ||
            target.classList.contains('goog-te-balloon-frame') ||
            target.getAttribute('id')?.includes('google') ||
            target.querySelector('.goog-te-banner-frame') !== null
          );
        }

        if (mutation.type === 'childList') {
          const target = mutation.target as Element;
          const addedNodes = Array.from(mutation.addedNodes);
          return addedNodes.some((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as Element;
              return (
                el.classList.contains('goog-te-banner-frame') ||
                el.classList.contains('goog-te-balloon-frame') ||
                el.getAttribute('id')?.includes('google') ||
                el.querySelector('.goog-te-banner-frame') !== null
              );
            }
            return false;
          });
        }

        return false;
      });

      if (isGoogleTranslateChange) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setKey((prev) => prev + 1);
        }, 100);
      }
    });

    observerRef.current.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'id', 'data-tts-active'],
      childList: true,
      subtree: true,
      characterData: false,
    });

    const errorHandler = (event: ErrorEvent) => {
      if (
        event.error?.name === 'NotFoundError' &&
        event.error?.message?.includes('removeChild') &&
        event.error?.message?.includes('not a child')
      ) {
        event.preventDefault();
        event.stopPropagation();
        
        setKey((prev) => prev + 1);
        return false;
      }
    };

    window.addEventListener('error', errorHandler, true);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('error', errorHandler, true);
    };
  }, []);

  return key;
}

