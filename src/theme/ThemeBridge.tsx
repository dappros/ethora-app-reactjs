import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ReactNode, useEffect, useMemo } from 'react';
import { ToastContainer } from 'react-toastify';
import { applyResolvedUiTheme } from '../utils/uiTheme';
import { useResolvedUiTheme } from './useResolvedUiTheme';

// Applies the resolved theme everywhere the app draws colour from:
//   * the `dark` class on <html>, which swaps the CSS tokens behind the
//     Tailwind palette (index.css);
//   * MUI's palette mode, for the MUI components still in use;
//   * react-toastify's built-in light / dark toast styles.
export function ThemeBridge({ children }: { children: ReactNode }) {
  const resolved = useResolvedUiTheme();

  useEffect(() => {
    applyResolvedUiTheme(resolved);
  }, [resolved]);

  const muiTheme = useMemo(
    () => createTheme({ palette: { mode: resolved } }),
    [resolved]
  );

  return (
    <ThemeProvider theme={muiTheme}>
      {children}
      <ToastContainer theme={resolved} />
    </ThemeProvider>
  );
}
