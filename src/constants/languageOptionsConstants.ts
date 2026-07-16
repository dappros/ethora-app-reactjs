// Targets for the chat-component's dynamic MESSAGE translation
// (`config.translates`). Broader than the static-UI set below - the
// component translates message content into any of these on demand.
export const LANGUAGE_OPTIONS = [
  { name: 'English', id: 'en' },
  { name: 'Spanish', id: 'es' },
  { name: 'Portuguese', id: 'pt' },
  { name: 'Haitian Creole', id: 'ht' },
  { name: 'Chinese', id: 'zh' },
];

// Languages the installed @ethora/chat-component build has NATIVE, built-in
// static UI captions for ("Search...", "Type message", "online", etc - see
// `config.i18n`). This is intentionally a NARROWER, separate list from
// LANGUAGE_OPTIONS above: the component ships full first-party en/fr/es
// caption dictionaries internally, so we don't hand-roll our own translated
// strings.ts (that would just duplicate what already ships for free and rot
// out of sync). Any locale outside this set falls back to English for the
// static UI (message translation via LANGUAGE_OPTIONS is unaffected).
//
// IMPORTANT: this is a manually-curated mirror of the chat-component's
// internal locale dictionary, not something derived at runtime - when
// @ethora/chat-component is upgraded, check its i18n dictionaries (built-in
// captions) for added/removed languages and update this list to match, or
// the language picker below will offer languages that silently fall back to
// English.
export const UI_LANGUAGE_OPTIONS = [
  { name: 'English', id: 'en' },
  { name: 'Français', id: 'fr' },
  { name: 'Español', id: 'es' },
] as const;

export type UiLanguageCode = (typeof UI_LANGUAGE_OPTIONS)[number]['id'];
