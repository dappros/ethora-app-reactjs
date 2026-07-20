export const UI_LANGUAGE_OPTIONS = [
  { name: 'English', id: 'en-CA' },
  { name: 'Français', id: 'fr-CA' },
  { name: 'Español', id: 'es-US' },
] as const;

export type UiLocale = (typeof UI_LANGUAGE_OPTIONS)[number]['id'];

export type UiLanguageCode = 'en' | 'fr' | 'es';

export function toBaseLanguage(locale: string | null | undefined): UiLanguageCode {
  const base = String(locale || '').split('-')[0].trim().toLowerCase();
  return base === 'fr' || base === 'es' ? base : 'en';
}

export const LANGUAGE_OPTIONS = [
  { name: 'English', id: 'en-CA' },
  { name: 'Español', id: 'es-US' },
  // { name: 'Portuguese', id: 'pt' },
  { name: 'Français', id: 'fr-CA' },
  // { name: 'Haitian Creole', id: 'ht' },
  // { name: 'Chinese', id: 'zh' },
];
