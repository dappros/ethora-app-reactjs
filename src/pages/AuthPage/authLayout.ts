import type { ModelApp } from '../../models';

type WelcomeFields = Partial<
  Pick<ModelApp, 'welcomeTitle' | 'welcomeDescription' | 'welcomeImage' | 'welcomeLayout'>
>;

// True when the App's owner has set up a welcome screen (Settings >
// Appearance). Apps without any of the fields keep the original sign-in and
// sign-up pages, pixel for pixel.
export function hasWelcomeScreen(app?: WelcomeFields | null): boolean {
  if (!app) return false;
  return Boolean(
    app.welcomeTitle?.trim() ||
      app.welcomeDescription?.trim() ||
      app.welcomeImage ||
      app.welcomeLayout === 'centered'
  );
}

// Logo column above the form (phones, and the "Centered" welcome layout) or
// beside it (the default desktop layout).
export function isStackedAuthLayout(
  app: WelcomeFields | null | undefined,
  isMobile: boolean
): boolean {
  return isMobile || app?.welcomeLayout === 'centered';
}

// Title of the sign-in card ("Sign in"), shared with the Appearance preview.
export const authCardTitleSx = {
  fontFamily: '"Varela Round", system-ui, sans-serif',
  fontWeight: 400,
  fontSize: '24px',
  height: '32px',
  color: 'rgb(var(--c-gray-950))',
  m: 0,
} as const;
