import type { ModelApp } from '../../models';

// Welcome screen fields as edited in Settings > Appearance. Unset fields read
// as the defaults, which is today's sign-in page.
export type WelcomeOptions = {
  welcomeTitle: string;
  welcomeDescription: string;
  welcomeLayout: 'split' | 'centered';
  welcomeImage: string;
  welcomeImageFit: 'cover' | 'contain';
};

export function getWelcomeOptions(app?: ModelApp): WelcomeOptions {
  return {
    welcomeTitle: app?.welcomeTitle || '',
    welcomeDescription: app?.welcomeDescription || '',
    welcomeLayout: app?.welcomeLayout || 'split',
    welcomeImage: app?.welcomeImage || '',
    welcomeImageFit: app?.welcomeImageFit || 'cover',
  };
}
