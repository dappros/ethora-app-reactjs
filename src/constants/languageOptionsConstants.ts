// Targets for the chat-component's dynamic MESSAGE translation
// (`config.translates`). Broader than the static-UI set below - the
// component translates message content into any of these on demand.
export const LANGUAGE_OPTIONS = [
  { name: 'English', id: 'en' },
  { name: 'Español', id: 'es' },
  // { name: 'Portuguese', id: 'pt' },
  { name: 'Français', id: 'fr' },
  // { name: 'Haitian Creole', id: 'ht' },
  // { name: 'Chinese', id: 'zh' },
];

export const UI_LANGUAGE_OPTIONS = [
  { name: 'English', id: 'en' },
  { name: 'Français', id: 'fr' },
  { name: 'Español', id: 'es' },
] as const;

export type UiLanguageCode = (typeof UI_LANGUAGE_OPTIONS)[number]['id'];
