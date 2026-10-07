import type { AiWidgetAppearance } from '../../../lib/aiWidgetAppearance';

// What the widget renders when a field is left unset (ai-assistant-ui
// Assistant.tsx / appearance.ts). The preview and the color swatches fall back
// to these so "unset" never looks like "missing".
export const WIDGET_DEFAULTS = {
  primary: '#1976d2',
  secondary: '#E1E4FE',
  otherBubble: '#F3F4FC',
  input: '#FCFCFC',
  gradientFrom: '#6e72fc',
  gradientTo: '#ad1deb',
  cta: 'Ask me anything!',
  launcherSize: 56,
  ctaDelay: 1200,
} as const;

const HEX6 = /^#?[0-9a-fA-F]{6}$/;

export function toHex(value: string | undefined | null): string | null {
  if (!value) return null;
  const v = value.trim();
  return HEX6.test(v) ? (v.startsWith('#') ? v : `#${v}`).toLowerCase() : null;
}

function mix(hex: string, target: number, amount: number): string {
  const h = toHex(hex);
  if (!h) return hex;
  const n = parseInt(h.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(c + (target - c) * amount)
  );
  return `#${ch.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

export const tint = (hex: string, amount: number) => mix(hex, 255, amount);
export const shade = (hex: string, amount: number) => mix(hex, 0, amount);

// Text color that stays readable on `bg` (WCAG relative luminance threshold).
export function readableOn(bg: string): string {
  const h = toHex(bg);
  if (!h) return '#141414';
  const n = parseInt(h.slice(1), 16);
  const lin = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const l = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  return l > 0.45 ? '#141414' : '#ffffff';
}

type ThemeFields = Pick<
  AiWidgetAppearance,
  | 'primaryColor'
  | 'secondaryColor'
  | 'iconsColor'
  | 'ownBubbleBg'
  | 'otherBubbleBg'
  | 'inputBg'
  | 'launcherGradient'
  | 'flatLauncher'
>;

export const THEME_FIELDS: Array<keyof ThemeFields> = [
  'primaryColor',
  'secondaryColor',
  'iconsColor',
  'ownBubbleBg',
  'otherBubbleBg',
  'inputBg',
  'launcherGradient',
  'flatLauncher',
];

export interface ThemePreset {
  id: string;
  labelKey: string;
  fields: ThemeFields;
}

const preset = (
  id: string,
  primary: string,
  own: string,
  other: string,
  gradient: string,
  icons = primary
): ThemePreset => ({
  id,
  labelKey: `aiWidgetAppearance.preset.${id}`,
  fields: {
    primaryColor: primary,
    secondaryColor: own,
    iconsColor: icons,
    ownBubbleBg: own,
    otherBubbleBg: other,
    inputBg: '',
    launcherGradient: gradient,
    flatLauncher: false,
  },
});

export function getThemePresets(brandColor?: string | null): ThemePreset[] {
  const brand = toHex(brandColor) || '#0052cd';
  return [
    {
      id: 'classic',
      labelKey: 'aiWidgetAppearance.preset.classic',
      fields: {
        primaryColor: '',
        secondaryColor: '',
        iconsColor: '',
        ownBubbleBg: '',
        otherBubbleBg: '',
        inputBg: '',
        launcherGradient: '',
        flatLauncher: false,
      },
    },
    {
      id: 'brand',
      labelKey: 'aiWidgetAppearance.preset.brand',
      fields: {
        primaryColor: brand,
        secondaryColor: tint(brand, 0.85),
        iconsColor: brand,
        ownBubbleBg: tint(brand, 0.85),
        otherBubbleBg: '#f3f4f6',
        inputBg: '',
        launcherGradient: '',
        flatLauncher: true,
      },
    },
    preset('ocean', '#0e7490', '#cffafe', '#f1f5f9', '06b6d4,0e7490'),
    preset('forest', '#15803d', '#dcfce7', '#f3f4f6', '22c55e,15803d'),
    preset('sunset', '#ea580c', '#ffedd5', '#f5f5f4', 'f59e0b,e11d48'),
    preset('midnight', '#1e293b', '#e0e7ff', '#f1f5f9', '6366f1,1e293b', '#6366f1'),
    {
      id: 'mono',
      labelKey: 'aiWidgetAppearance.preset.mono',
      fields: {
        primaryColor: '#111827',
        secondaryColor: '#e5e7eb',
        iconsColor: '#111827',
        ownBubbleBg: '#e5e7eb',
        otherBubbleBg: '#f9fafb',
        inputBg: '',
        launcherGradient: '',
        flatLauncher: true,
      },
    },
  ];
}

const norm = (v: unknown) => (typeof v === 'string' ? v.trim().toLowerCase().replace(/^#/, '') : v);

export function matchesPreset(a: AiWidgetAppearance, p: ThemePreset): boolean {
  return THEME_FIELDS.every((k) => norm(a[k]) === norm(p.fields[k]));
}

// Suggested swatches in every color popover: the app's brand color first.
export function getSwatches(brandColor?: string | null): string[] {
  const base = [
    '#1976d2',
    '#0052cd',
    '#6366f1',
    '#ad1deb',
    '#e11d48',
    '#ea580c',
    '#f59e0b',
    '#15803d',
    '#0e7490',
    '#111827',
    '#f3f4f6',
    '#ffffff',
  ];
  const brand = toHex(brandColor);
  return brand && !base.includes(brand) ? [brand, ...base.slice(0, -1)] : base;
}

export const GRADIENT_PRESETS: Array<[string, string]> = [
  ['#6e72fc', '#ad1deb'],
  ['#06b6d4', '#0e7490'],
  ['#22c55e', '#15803d'],
  ['#f59e0b', '#e11d48'],
  ['#6366f1', '#1e293b'],
  ['#f472b6', '#8b5cf6'],
];

export interface FontOption {
  id: string;
  label: string;
  fontFamily: string;
  googleFont: string;
}

const SYSTEM_STACK =
  "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const google = (name: string): FontOption => ({
  id: name,
  label: name,
  fontFamily: `'${name}', sans-serif`,
  googleFont: name,
});

export const FONT_OPTIONS: FontOption[] = [
  { id: 'default', label: '', fontFamily: '', googleFont: '' },
  { id: 'system', label: '', fontFamily: SYSTEM_STACK, googleFont: '' },
  google('Inter'),
  google('Roboto'),
  google('Open Sans'),
  google('Lato'),
  google('Poppins'),
  google('Montserrat'),
  google('Nunito'),
  google('Source Sans 3'),
];

export const CUSTOM_FONT_ID = 'custom';

export function detectFontOption(a: AiWidgetAppearance): string {
  const hit = FONT_OPTIONS.find(
    (o) => o.fontFamily === a.fontFamily && o.googleFont === a.googleFont
  );
  return hit ? hit.id : CUSTOM_FONT_ID;
}

// Locales the widget and chat-component ship captions for. Anything else
// stored on the app is kept and shown as its own option.
export const LOCALE_OPTIONS: Array<{ code: string; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'ht', label: 'Kreyòl ayisyen' },
  { code: 'zh', label: '中文' },
];

export interface SizePreset {
  id: string;
  labelKey: string;
  width: string;
  height: string;
}

export const SIZE_PRESETS: SizePreset[] = [
  { id: 'default', labelKey: 'aiWidgetAppearance.sizePresetDefault', width: '', height: '' },
  { id: 'compact', labelKey: 'aiWidgetAppearance.sizePresetCompact', width: '320px', height: '440px' },
  { id: 'standard', labelKey: 'aiWidgetAppearance.sizePresetStandard', width: '380px', height: '520px' },
  { id: 'large', labelKey: 'aiWidgetAppearance.sizePresetLarge', width: '420px', height: '620px' },
  { id: 'tall', labelKey: 'aiWidgetAppearance.sizePresetTall', width: '380px', height: '80vh' },
];

// The widget's default panel size, and the desktop viewport the preview
// resolves vw/vh/% lengths against.
export const DEFAULT_WIDTH = 'calc(20vw + 30px)';
export const DEFAULT_HEIGHT = 'calc(40vh + 32px)';
const VIEWPORT = { w: 1440, h: 900 };

// Resolves the CSS lengths the widget accepts (px, %, vw, vh, rem, em, a bare
// number, and calc() sums of those) to pixels on a typical desktop viewport.
export function resolveLength(value: string, axis: 'w' | 'h', fallback: string): number {
  const v = (value || '').trim() || fallback;
  const unit = (n: number, u: string) => {
    switch (u) {
      case 'vw':
        return (n / 100) * VIEWPORT.w;
      case 'vh':
      case 'svh':
      case 'dvh':
        return (n / 100) * VIEWPORT.h;
      case '%':
        return (n / 100) * (axis === 'w' ? VIEWPORT.w : VIEWPORT.h);
      case 'rem':
      case 'em':
        return n * 16;
      default:
        return n;
    }
  };
  const giveUp = () =>
    v === fallback ? (axis === 'w' ? 380 : 520) : resolveLength(fallback, axis, fallback);
  const inner = v.replace(/^calc\((.*)\)$/i, '$1');
  const terms = inner.match(/[+-]?\s*\d+(\.\d+)?\s*(px|%|vw|vh|svh|dvh|rem|em)?/gi);
  if (!terms) return giveUp();
  const total = terms.reduce((sum, term) => {
    const m = term.replace(/\s+/g, '').match(/^([+-]?)(\d+(?:\.\d+)?)([a-z%]*)$/i);
    if (!m) return sum;
    const n = unit(parseFloat(m[2]), m[3].toLowerCase());
    return m[1] === '-' ? sum - n : sum + n;
  }, 0);
  return total > 0 ? total : giveUp();
}
