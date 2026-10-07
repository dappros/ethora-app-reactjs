// Appearance customization for the AI Widget's embeddable assistant
// (@ethora/ai-chat-widget, ethora_assistant.js).
//
// Field names and data-* mapping mirror the widget's own contract, the
// single source of truth for which is ai-assistant-ui/src/widget/attributes.ts
// (WIDGET_ATTRIBUTES) and src/widget/appearance.ts (readAppearance). This
// file intentionally excludes the 'core' group (data-app-id, data-api-base)
// and the persona attrs (data-bot-name, data-bot-avatar): both are already
// resolved elsewhere in this app (appId from the route, apiBase from env,
// persona from the active Agent - see TabAIWidgetCode.tsx) and are not
// operator-editable "appearance" per this app's existing design.
//
// Stored on the App (GET/PUT /v2/apps/:appId/widget/appearance) as the very
// data-* attributes the snippet would carry, non-defaults only. The widget
// reads them at load from GET /v2/widget/config, beneath anything written on
// the embed itself, so a change applies to live sites without re-pasting the
// snippet. The localStorage copy below is only read once, to offer moving
// settings saved by an older admin build to the server.

export interface AiWidgetAppearance {
  // Copy
  title: string;
  greetingTitle: string;
  greeting: string;
  greetingMessage: string;
  locale: string;
  hideSystemMessages: boolean;

  // Theme
  primaryColor: string;
  secondaryColor: string;
  iconsColor: string;
  ownBubbleBg: string;
  otherBubbleBg: string;
  inputBg: string;
  fontFamily: string;
  fontSize: string;
  googleFont: string;

  // Layout
  position: 'left' | 'right';
  width: string;
  height: string;
  expandedWidth: string;
  expandedHeight: string;
  expandedInset: string;
  disableMedia: boolean;
  allowFullscreen: boolean;
  startFullscreen: boolean;

  // Launcher & call to action
  launcherIcon: string;
  launcherGradient: string; // "hex1,hex2", e.g. "6e72fc,ad1deb"
  flatLauncher: boolean;
  launcherSize: number;
  launcherGlow: boolean;
  ctaText: string;
  ctaDelay: number;
  ctaSparkle: boolean;
}

// The widget's own built-in defaults (readAppearance's fallbacks). A field
// left at its default is omitted from the generated embed snippet, so
// operators who never touch this panel still get a minimal snippet.
export const defaultAiWidgetAppearance: AiWidgetAppearance = {
  title: '',
  greetingTitle: '',
  greeting: '',
  greetingMessage: '',
  locale: '',
  hideSystemMessages: true,

  primaryColor: '',
  secondaryColor: '',
  iconsColor: '',
  ownBubbleBg: '',
  otherBubbleBg: '',
  inputBg: '',
  fontFamily: '',
  fontSize: '',
  googleFont: '',

  position: 'right',
  width: '',
  height: '',
  expandedWidth: '',
  expandedHeight: '',
  expandedInset: '',
  disableMedia: true,
  allowFullscreen: true,
  startFullscreen: false,

  launcherIcon: '',
  launcherGradient: '',
  flatLauncher: false,
  launcherSize: 56,
  launcherGlow: true,
  ctaText: 'Ask me anything!',
  ctaDelay: 1200,
  ctaSparkle: true,
};

// Swatch colors to show for an unset color field, matching the widget's own
// fallback (appearance.ts DEFAULT_PRIMARY / DEFAULT_SECONDARY). Purely a UI
// hint - the underlying setting stays '' (unset) until the operator picks.
export const WIDGET_DEFAULT_SWATCHES: Partial<Record<keyof AiWidgetAppearance, string>> = {
  primaryColor: '#1976d2',
  secondaryColor: '#E1E4FE',
};

const ATTR_MAP: Array<{
  key: keyof AiWidgetAppearance;
  attr: string;
  isDefault: (s: AiWidgetAppearance) => boolean;
  serialize?: (s: AiWidgetAppearance) => string;
}> = [
  { key: 'title', attr: 'data-title', isDefault: (s) => !s.title },
  { key: 'greetingTitle', attr: 'data-greeting-title', isDefault: (s) => !s.greetingTitle },
  { key: 'greeting', attr: 'data-greeting', isDefault: (s) => !s.greeting },
  { key: 'greetingMessage', attr: 'data-greeting-message', isDefault: (s) => !s.greetingMessage },
  { key: 'locale', attr: 'data-locale', isDefault: (s) => !s.locale },
  {
    key: 'hideSystemMessages',
    attr: 'data-hide-system-messages',
    isDefault: (s) => s.hideSystemMessages === true,
    serialize: (s) => String(s.hideSystemMessages),
  },

  { key: 'primaryColor', attr: 'data-primary-color', isDefault: (s) => !s.primaryColor },
  { key: 'secondaryColor', attr: 'data-secondary-color', isDefault: (s) => !s.secondaryColor },
  { key: 'iconsColor', attr: 'data-icons-color', isDefault: (s) => !s.iconsColor },
  { key: 'ownBubbleBg', attr: 'data-own-bubble-bg', isDefault: (s) => !s.ownBubbleBg },
  { key: 'otherBubbleBg', attr: 'data-other-bubble-bg', isDefault: (s) => !s.otherBubbleBg },
  { key: 'inputBg', attr: 'data-input-bg', isDefault: (s) => !s.inputBg },
  { key: 'fontFamily', attr: 'data-font-family', isDefault: (s) => !s.fontFamily },
  { key: 'fontSize', attr: 'data-font-size', isDefault: (s) => !s.fontSize },
  { key: 'googleFont', attr: 'data-google-font', isDefault: (s) => !s.googleFont },

  { key: 'position', attr: 'data-position', isDefault: (s) => s.position === 'right' },
  { key: 'width', attr: 'data-width', isDefault: (s) => !s.width },
  { key: 'height', attr: 'data-height', isDefault: (s) => !s.height },
  { key: 'expandedWidth', attr: 'data-expanded-width', isDefault: (s) => !s.expandedWidth },
  { key: 'expandedHeight', attr: 'data-expanded-height', isDefault: (s) => !s.expandedHeight },
  { key: 'expandedInset', attr: 'data-expanded-inset', isDefault: (s) => !s.expandedInset },
  {
    key: 'disableMedia',
    attr: 'data-disable-media',
    isDefault: (s) => s.disableMedia === true,
    serialize: (s) => String(s.disableMedia),
  },
  {
    key: 'allowFullscreen',
    attr: 'data-allow-fullscreen',
    isDefault: (s) => s.allowFullscreen === true,
    serialize: (s) => String(s.allowFullscreen),
  },
  {
    key: 'startFullscreen',
    attr: 'data-start-fullscreen',
    isDefault: (s) => s.startFullscreen === false,
    serialize: (s) => String(s.startFullscreen),
  },

  { key: 'launcherIcon', attr: 'data-launcher-icon', isDefault: (s) => !s.launcherIcon },
  { key: 'launcherGradient', attr: 'data-launcher-gradient', isDefault: (s) => !s.launcherGradient },
  {
    key: 'flatLauncher',
    attr: 'data-flat-launcher',
    isDefault: (s) => s.flatLauncher === false,
    serialize: (s) => String(s.flatLauncher),
  },
  {
    key: 'launcherSize',
    attr: 'data-launcher-size',
    isDefault: (s) => s.launcherSize === 56,
    serialize: (s) => String(s.launcherSize),
  },
  {
    key: 'launcherGlow',
    attr: 'data-launcher-glow',
    isDefault: (s) => s.launcherGlow === true,
    serialize: (s) => String(s.launcherGlow),
  },
  { key: 'ctaText', attr: 'data-cta-text', isDefault: (s) => s.ctaText === 'Ask me anything!' },
  {
    key: 'ctaDelay',
    attr: 'data-cta-delay',
    isDefault: (s) => s.ctaDelay === 1200,
    serialize: (s) => String(s.ctaDelay),
  },
  {
    key: 'ctaSparkle',
    attr: 'data-cta-sparkle',
    isDefault: (s) => s.ctaSparkle === true,
    serialize: (s) => String(s.ctaSparkle),
  },
];

/** Every non-default data-* attribute this operator has actually set. */
export function getAppearanceAttributes(settings: AiWidgetAppearance): Array<[string, string]> {
  return ATTR_MAP.filter((entry) => !entry.isDefault(settings)).map((entry) => [
    entry.attr,
    entry.serialize ? entry.serialize(settings) : String(settings[entry.key]),
  ]);
}

/** Every non-default attribute as a record, the shape the API stores. */
export function getAppearanceAttributeRecord(settings: AiWidgetAppearance): Record<string, string> {
  return Object.fromEntries(getAppearanceAttributes(settings));
}

/**
 * The panel's settings from stored attributes (the inverse of
 * getAppearanceAttributes). Unknown attributes are ignored; a field the record
 * does not mention keeps its default.
 */
export function appearanceFromAttributes(attrs: Record<string, string> | null | undefined): AiWidgetAppearance {
  const out: AiWidgetAppearance = { ...defaultAiWidgetAppearance };
  if (!attrs) return out;
  const target = out as unknown as Record<string, string | number | boolean>;
  for (const entry of ATTR_MAP) {
    const raw = attrs[entry.attr];
    if (raw === undefined || raw === null) continue;
    const fallback = defaultAiWidgetAppearance[entry.key];
    if (typeof fallback === 'boolean') {
      const t = String(raw).trim().toLowerCase();
      target[entry.key] = t === '' || t === 'true' || t === '1' || t === 'yes';
    } else if (typeof fallback === 'number') {
      const n = parseInt(String(raw), 10);
      target[entry.key] = Number.isFinite(n) ? n : fallback;
    } else {
      target[entry.key] = String(raw);
    }
  }
  return out;
}

const appStorageKey = (appId: string) => `ethora_ai_widget_appearance_${appId}`;

/**
 * Settings an older admin build saved in this browser only, if any were
 * changed from the defaults - offered once for moving to the server.
 */
export function loadLegacyBrowserAppearance(appId: string): AiWidgetAppearance | null {
  try {
    const raw = localStorage.getItem(appStorageKey(appId));
    if (!raw) return null;
    const parsed = { ...defaultAiWidgetAppearance, ...JSON.parse(raw) };
    return getAppearanceAttributes(parsed).length ? parsed : null;
  } catch {
    return null;
  }
}

/** Forgets this browser's copy once it has been moved to the server (or declined). */
export function clearLegacyBrowserAppearance(appId: string): void {
  try {
    localStorage.removeItem(appStorageKey(appId));
  } catch {
    // Storage unavailable: nothing to clear.
  }
}
