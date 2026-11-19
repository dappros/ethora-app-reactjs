import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ReactNode, useEffect, useMemo } from 'react';
import { ToastContainer } from 'react-toastify';
import { applyResolvedUiTheme } from '../utils/uiTheme';
import { useResolvedUiTheme } from './useResolvedUiTheme';

// Applies the resolved theme everywhere the app draws colour from:
//   * the `dark` class on <html>, which swaps the CSS tokens behind the
//     Tailwind palette (index.css);
//   * MUI's palette mode, for the MUI components still in use, and normal
//     case on their buttons;
//   * react-toastify's built-in light / dark toast styles.
export function ThemeBridge({ children }: { children: ReactNode }) {
  const resolved = useResolvedUiTheme();

  useEffect(() => {
    applyResolvedUiTheme(resolved);
  }, [resolved]);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: { mode: resolved },
        // Normal case on every MUI button, tab and toggle (MUI's default is
        // capitals), to match the panel's own Tailwind buttons.
        typography: { button: { textTransform: 'none' } },
        components: {
          MuiButton: { styleOverrides: { root: { textTransform: 'none' } } },
          MuiTab: { styleOverrides: { root: { textTransform: 'none' } } },
          MuiToggleButton: { styleOverrides: { root: { textTransform: 'none' } } },
        },
      }),
    [resolved]
  );

  return (
    <ThemeProvider theme={muiTheme}>
      {children}
      <ToastContainer theme={resolved} />
    </ThemeProvider>
  );
}
