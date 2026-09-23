import { resolveAvailableLanguages } from '../../constants/languageOptionsConstants';
import { useAppStore } from '../../store/useAppStore';

// Is there anything for LanguageSettings to show? Callers use this to drop
// the surrounding card/heading too, so a single-language install doesn't get
// an empty "Language" section.
export function useHasLanguageSettings(): boolean {
  const availableLanguages = useAppStore((s) => s.availableLanguages);
  return resolveAvailableLanguages(availableLanguages).length > 1;
}
