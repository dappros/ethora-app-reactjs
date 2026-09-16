import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// AssistantAppearancePanel.tsx (AI Widget tab). fr/es duplicate the English
// copy for now (real translation is a follow-up) - useTranslation.ts falls
// back to English for any key missing from a locale, but every other
// dictionary in this folder satisfies the full Record<UiLanguageCode, ...>
// shape, so this one does too rather than being the one partial exception.
const en = {
    'aiWidgetAppearance.title': 'Widget appearance',
    'aiWidgetAppearance.description':
      'Customize how the assistant widget looks and behaves on your site. Changes apply to Test widget above and to the embed code below once you save.',
    'aiWidgetAppearance.saveButton': 'Save appearance',
    'aiWidgetAppearance.resetButton': 'Reset to defaults',
    'aiWidgetAppearance.saved': 'Widget appearance saved',
    'aiWidgetAppearance.unsavedHint': 'Unsaved changes',

    'aiWidgetAppearance.sectionCopy': 'Copy',
    'aiWidgetAppearance.sectionTheme': 'Colors & fonts',
    'aiWidgetAppearance.sectionLayout': 'Layout & size',
    'aiWidgetAppearance.sectionLauncher': 'Launcher & call to action',

    'aiWidgetAppearance.titleLabel': 'Popup title',
    'aiWidgetAppearance.titlePlaceholder': "(bot's name)",
    'aiWidgetAppearance.greetingTitleLabel': 'Greeting title',
    'aiWidgetAppearance.greetingTitlePlaceholder': 'Ask me anything',
    'aiWidgetAppearance.greetingLabel': 'Greeting body line',
    'aiWidgetAppearance.greetingPlaceholder':
      'I can help with pricing, setup and support.',
    'aiWidgetAppearance.greetingMessageLabel': 'Opening bot message',
    'aiWidgetAppearance.greetingMessagePlaceholder': 'Hi! How can I help?',
    'aiWidgetAppearance.localeLabel': 'Locale (BCP-47)',
    'aiWidgetAppearance.localePlaceholder': 'e.g. en, uk',
    'aiWidgetAppearance.hideSystemMessagesLabel': 'Hide "joined" system messages',

    'aiWidgetAppearance.primaryColorLabel': 'Primary',
    'aiWidgetAppearance.secondaryColorLabel': 'Secondary',
    'aiWidgetAppearance.iconsColorLabel': 'Icons',
    'aiWidgetAppearance.ownBubbleBgLabel': 'Visitor message bubble',
    'aiWidgetAppearance.otherBubbleBgLabel': 'Bot message bubble',
    'aiWidgetAppearance.inputBgLabel': 'Input bar',
    'aiWidgetAppearance.resetColor': 'Use widget default',
    'aiWidgetAppearance.fontFamilyLabel': 'Font family',
    'aiWidgetAppearance.fontFamilyPlaceholder': 'e.g. Inter, sans-serif',
    'aiWidgetAppearance.fontSizeLabel': 'Font size',
    'aiWidgetAppearance.fontSizePlaceholder': 'e.g. 16',
    'aiWidgetAppearance.googleFontLabel': 'Google Font (auto-loaded)',
    'aiWidgetAppearance.googleFontPlaceholder': 'e.g. Inter',

    'aiWidgetAppearance.positionLabel': 'Docked side',
    'aiWidgetAppearance.positionRight': 'Right',
    'aiWidgetAppearance.positionLeft': 'Left',
    'aiWidgetAppearance.quickSizesLabel': 'Quick sizes',
    'aiWidgetAppearance.sizePresetDefault': 'Widget default',
    'aiWidgetAppearance.sizePresetCompact': 'Compact',
    'aiWidgetAppearance.sizePresetStandard': 'Standard',
    'aiWidgetAppearance.sizePresetLarge': 'Large',
    'aiWidgetAppearance.sizePresetTall': 'Tall',
    'aiWidgetAppearance.widthLabel': 'Width',
    'aiWidgetAppearance.heightLabel': 'Height',
    'aiWidgetAppearance.expandedWidthLabel': 'Expanded width',
    'aiWidgetAppearance.expandedHeightLabel': 'Expanded height',
    'aiWidgetAppearance.expandedInsetLabel': 'Expanded inset',
    'aiWidgetAppearance.disableMediaLabel': 'Disable attach/mic controls',
    'aiWidgetAppearance.allowFullscreenLabel': 'Allow fullscreen expand',
    'aiWidgetAppearance.startFullscreenLabel': 'Start expanded',

    'aiWidgetAppearance.launcherIconLabel': 'Launcher icon URL',
    'aiWidgetAppearance.launcherGradientStartLabel': 'Gradient start',
    'aiWidgetAppearance.launcherGradientEndLabel': 'Gradient end',
    'aiWidgetAppearance.flatLauncherLabel': 'Flat launcher (use primary color)',
    'aiWidgetAppearance.launcherSizeLabel': 'Launcher size',
    'aiWidgetAppearance.launcherGlowLabel': 'Pulsing glow',
    'aiWidgetAppearance.ctaTextLabel': 'Teaser text',
    'aiWidgetAppearance.ctaTextPlaceholder': 'Ask me anything!',
    'aiWidgetAppearance.ctaDelayLabel': 'Teaser delay (ms)',
    'aiWidgetAppearance.ctaSparkleLabel': 'Sparkle icon',
};

export const aiWidgetAppearance = {
  en,
  fr: en,
  es: en,
} satisfies Record<UiLanguageCode, Record<string, string>>;
