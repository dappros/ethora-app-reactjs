import { useSyncExternalStore } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  ResolvedUiTheme,
  resolveUiTheme,
  subscribeToSystemTheme,
  systemPrefersDark,
} from '../utils/uiTheme';

// The theme actually in effect: the stored choice, with 'system' resolved
// against the OS setting and re-evaluated live when the OS flips.
export function useResolvedUiTheme(): ResolvedUiTheme {
  const theme = useAppStore((s) => s.uiTheme);
  const systemDark = useSyncExternalStore(
    subscribeToSystemTheme,
    systemPrefersDark,
    () => false
  );
  if (theme === 'system') return systemDark ? 'dark' : 'light';
  return resolveUiTheme(theme);
}
