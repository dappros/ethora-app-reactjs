import { useCallback } from 'react';
import { toBaseLanguage } from '../constants/languageOptionsConstants';
import { useAppStore } from '../store/useAppStore';
import { translations } from './translations';

// Reads the app-wide language from the store (see appStore.ts's uiLanguage /
// doSetUiLanguage) so every component using this hook re-renders on
// language change - no page reload needed. `t()` falls back to the English
// string for any key not yet translated in the active locale, else to the
// raw key itself, so a missing/partial translation degrades gracefully
// instead of crashing or rendering blank text.
//
// `key` is typed as `string`, not a strict literal union: the dictionary is
// split across many files under translations/ (one per app area) that can be
// edited independently, so tying `t()`'s type to "every key that currently
// exists" would force every edit through a single shared union type.
export function useTranslation() {
  const locale = useAppStore((s) => s.uiLanguage);
  const language = toBaseLanguage(locale);

  // Memoized on `language` so `t` keeps a STABLE identity across renders.
  // Callers legitimately need `t` in useMemo/useCallback dep arrays (any memo
  // that renders translated text must recompute when the language changes -
  // e.g. LogoContent's logo `alt`). If `t` were re-created every render, adding
  // it to those deps would silently defeat the memo; omitting it would leave
  // stale text after a language switch. useCallback gives both: recompute on
  // language change, no churn otherwise.
  const t = useCallback(
    (key: string): string =>
      translations[language]?.[key] ?? translations.en[key] ?? key,
    [language]
  );

  return { t, language, locale };
}
