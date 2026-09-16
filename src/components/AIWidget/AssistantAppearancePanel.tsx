import {
  Checkbox,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Field,
  Label,
} from '@headlessui/react';
import { Button } from '@mui/material';
import { ReactNode } from 'react';
import { IconArrowDown } from '../Icons/IconArrowDown';
import { IconCheckbox } from '../Icons/IconCheckbox';
import { useTranslation } from '../../i18n/useTranslation';
import {
  AiWidgetAppearance,
  WIDGET_DEFAULT_SWATCHES,
} from '../../lib/aiWidgetAppearance';
import { PopoverColorPicker } from '../PopoverColorPicker';

interface Props {
  appearance: AiWidgetAppearance;
  onChange: (updates: Partial<AiWidgetAppearance>) => void;
  onSave: () => void;
  onReset: () => void;
  isDirty: boolean;
}

// Same input look as AppSettings/Appearance.tsx (bg-gray-100 rounded-xl),
// so this panel reads as part of the same settings surface.
const inputClass = 'bg-gray-100 py-2 px-4 rounded-xl w-full text-sm';

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <Disclosure
      as="div"
      defaultOpen={defaultOpen}
      className="mb-3 border border-gray-200 rounded-xl overflow-hidden"
    >
      {({ open }) => (
        <>
          <DisclosureButton className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left">
            <span className="font-sans font-semibold text-sm">{title}</span>
            <span
              className="shrink-0 transition-transform"
              style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <IconArrowDown width={18} height={18} />
            </span>
          </DisclosureButton>
          <DisclosurePanel className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
            {children}
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}

function TextRow({
  id,
  label,
  value,
  placeholder,
  onChange,
  full = false,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  full?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label htmlFor={id} className="block font-sans text-xs text-gray-600 mb-1">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}

function NumberRow({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-sans text-xs text-gray-600 mb-1">
        {label}
      </label>
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={inputClass}
      />
    </div>
  );
}

function ToggleRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Field className="flex items-center cursor-pointer sm:col-span-2 py-1">
      <Checkbox
        id={id}
        checked={checked}
        onChange={onChange}
        className="group mr-2 size-5 shrink-0 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
      >
        <IconCheckbox className="hidden group-data-[checked]:block" />
      </Checkbox>
      <Label className="cursor-pointer font-sans text-sm">{label}</Label>
    </Field>
  );
}

function ColorRow({
  id,
  label,
  value,
  fallback,
  resetLabel,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  fallback: string;
  resetLabel: string;
  onChange: (v: string) => void;
}) {
  const isHex = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <div>
      <label htmlFor={id} className="block font-sans text-xs text-gray-600 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <PopoverColorPicker color={isHex ? value : fallback} onChange={onChange} />
        <input
          id={id}
          type="text"
          value={value}
          placeholder={fallback}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            title={resetLabel}
            className="text-xs text-gray-400 hover:text-gray-600 shrink-0"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

function SliderRow({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="sm:col-span-2">
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="font-sans text-xs text-gray-600">
          {label}
        </label>
        <span className="text-xs text-gray-500 font-mono tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-8 accent-brand-500 cursor-pointer"
      />
    </div>
  );
}

const SIZE_PRESETS = (t: (k: string) => string): Array<{ label: string; width: string; height: string }> => [
  { label: t('aiWidgetAppearance.sizePresetDefault'), width: '', height: '' },
  { label: t('aiWidgetAppearance.sizePresetCompact'), width: '320px', height: '440px' },
  { label: t('aiWidgetAppearance.sizePresetStandard'), width: '380px', height: '520px' },
  { label: t('aiWidgetAppearance.sizePresetLarge'), width: '420px', height: '620px' },
  { label: t('aiWidgetAppearance.sizePresetTall'), width: '380px', height: '80vh' },
];

export function AssistantAppearancePanel({
  appearance,
  onChange,
  onSave,
  onReset,
  isDirty,
}: Props) {
  const { t } = useTranslation();
  const [gradStart, gradEnd] = appearance.launcherGradient
    ? appearance.launcherGradient.split(',').map((c) => c.trim())
    : ['', ''];

  const setGradient = (start: string, end: string) => {
    const a = start.replace(/^#/, '');
    const b = end.replace(/^#/, '');
    onChange({ launcherGradient: a && b ? `${a},${b}` : '' });
  };

  return (
    <div className="w-full border border-gray-200 rounded-xl bg-white p-4 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <div className="font-sans font-semibold text-base">
            {t('aiWidgetAppearance.title')}
          </div>
          <p className="font-sans text-xs text-gray-500 mt-1 max-w-xl">
            {t('aiWidgetAppearance.description')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isDirty && (
            <span className="text-xs text-gray-500 font-sans">
              {t('aiWidgetAppearance.unsavedHint')}
            </span>
          )}
          <Button size="small" variant="text" onClick={onReset}>
            {t('aiWidgetAppearance.resetButton')}
          </Button>
          <Button size="small" variant="contained" onClick={onSave} disabled={!isDirty}>
            {t('aiWidgetAppearance.saveButton')}
          </Button>
        </div>
      </div>

      <Section title={t('aiWidgetAppearance.sectionCopy')} defaultOpen>
        <TextRow
          id="aw-title"
          label={t('aiWidgetAppearance.titleLabel')}
          value={appearance.title}
          placeholder={t('aiWidgetAppearance.titlePlaceholder')}
          onChange={(v) => onChange({ title: v })}
        />
        <TextRow
          id="aw-locale"
          label={t('aiWidgetAppearance.localeLabel')}
          value={appearance.locale}
          placeholder={t('aiWidgetAppearance.localePlaceholder')}
          onChange={(v) => onChange({ locale: v })}
        />
        <TextRow
          id="aw-greeting-title"
          label={t('aiWidgetAppearance.greetingTitleLabel')}
          value={appearance.greetingTitle}
          placeholder={t('aiWidgetAppearance.greetingTitlePlaceholder')}
          onChange={(v) => onChange({ greetingTitle: v })}
        />
        <TextRow
          id="aw-greeting"
          label={t('aiWidgetAppearance.greetingLabel')}
          value={appearance.greeting}
          placeholder={t('aiWidgetAppearance.greetingPlaceholder')}
          onChange={(v) => onChange({ greeting: v })}
        />
        <TextRow
          id="aw-greeting-message"
          label={t('aiWidgetAppearance.greetingMessageLabel')}
          value={appearance.greetingMessage}
          placeholder={t('aiWidgetAppearance.greetingMessagePlaceholder')}
          onChange={(v) => onChange({ greetingMessage: v })}
          full
        />
        <ToggleRow
          id="aw-hide-system"
          label={t('aiWidgetAppearance.hideSystemMessagesLabel')}
          checked={appearance.hideSystemMessages}
          onChange={(v) => onChange({ hideSystemMessages: v })}
        />
      </Section>

      <Section title={t('aiWidgetAppearance.sectionTheme')}>
        <ColorRow
          id="aw-primary"
          label={t('aiWidgetAppearance.primaryColorLabel')}
          value={appearance.primaryColor}
          fallback={WIDGET_DEFAULT_SWATCHES.primaryColor!}
          resetLabel={t('aiWidgetAppearance.resetColor')}
          onChange={(v) => onChange({ primaryColor: v })}
        />
        <ColorRow
          id="aw-secondary"
          label={t('aiWidgetAppearance.secondaryColorLabel')}
          value={appearance.secondaryColor}
          fallback={WIDGET_DEFAULT_SWATCHES.secondaryColor!}
          resetLabel={t('aiWidgetAppearance.resetColor')}
          onChange={(v) => onChange({ secondaryColor: v })}
        />
        <ColorRow
          id="aw-icons"
          label={t('aiWidgetAppearance.iconsColorLabel')}
          value={appearance.iconsColor}
          fallback={WIDGET_DEFAULT_SWATCHES.primaryColor!}
          resetLabel={t('aiWidgetAppearance.resetColor')}
          onChange={(v) => onChange({ iconsColor: v })}
        />
        <ColorRow
          id="aw-own-bubble"
          label={t('aiWidgetAppearance.ownBubbleBgLabel')}
          value={appearance.ownBubbleBg}
          fallback={WIDGET_DEFAULT_SWATCHES.secondaryColor!}
          resetLabel={t('aiWidgetAppearance.resetColor')}
          onChange={(v) => onChange({ ownBubbleBg: v })}
        />
        <ColorRow
          id="aw-other-bubble"
          label={t('aiWidgetAppearance.otherBubbleBgLabel')}
          value={appearance.otherBubbleBg}
          fallback="#F3F4FC"
          resetLabel={t('aiWidgetAppearance.resetColor')}
          onChange={(v) => onChange({ otherBubbleBg: v })}
        />
        <ColorRow
          id="aw-input-bg"
          label={t('aiWidgetAppearance.inputBgLabel')}
          value={appearance.inputBg}
          fallback="#FCFCFC"
          resetLabel={t('aiWidgetAppearance.resetColor')}
          onChange={(v) => onChange({ inputBg: v })}
        />
        <TextRow
          id="aw-font-family"
          label={t('aiWidgetAppearance.fontFamilyLabel')}
          value={appearance.fontFamily}
          placeholder={t('aiWidgetAppearance.fontFamilyPlaceholder')}
          onChange={(v) => onChange({ fontFamily: v })}
        />
        <TextRow
          id="aw-font-size"
          label={t('aiWidgetAppearance.fontSizeLabel')}
          value={appearance.fontSize}
          placeholder={t('aiWidgetAppearance.fontSizePlaceholder')}
          onChange={(v) => onChange({ fontSize: v })}
        />
        <TextRow
          id="aw-google-font"
          label={t('aiWidgetAppearance.googleFontLabel')}
          value={appearance.googleFont}
          placeholder={t('aiWidgetAppearance.googleFontPlaceholder')}
          onChange={(v) => onChange({ googleFont: v })}
          full
        />
      </Section>

      <Section title={t('aiWidgetAppearance.sectionLayout')}>
        <div>
          <label htmlFor="aw-position" className="block font-sans text-xs text-gray-600 mb-1">
            {t('aiWidgetAppearance.positionLabel')}
          </label>
          <select
            id="aw-position"
            value={appearance.position}
            onChange={(e) => onChange({ position: e.target.value as 'left' | 'right' })}
            className={inputClass}
          >
            <option value="right">{t('aiWidgetAppearance.positionRight')}</option>
            <option value="left">{t('aiWidgetAppearance.positionLeft')}</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <div className="block font-sans text-xs text-gray-600 mb-1">
            {t('aiWidgetAppearance.quickSizesLabel')}
          </div>
          <div className="flex flex-wrap gap-2">
            {SIZE_PRESETS(t).map((preset) => {
              const isActive = preset.width === appearance.width && preset.height === appearance.height;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChange({ width: preset.width, height: preset.height })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    isActive
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
        <TextRow
          id="aw-width"
          label={t('aiWidgetAppearance.widthLabel')}
          value={appearance.width}
          placeholder="calc(20vw + 30px)"
          onChange={(v) => onChange({ width: v })}
        />
        <TextRow
          id="aw-height"
          label={t('aiWidgetAppearance.heightLabel')}
          value={appearance.height}
          placeholder="calc(40vh + 32px)"
          onChange={(v) => onChange({ height: v })}
        />
        <TextRow
          id="aw-expanded-width"
          label={t('aiWidgetAppearance.expandedWidthLabel')}
          value={appearance.expandedWidth}
          placeholder="100%"
          onChange={(v) => onChange({ expandedWidth: v })}
        />
        <TextRow
          id="aw-expanded-height"
          label={t('aiWidgetAppearance.expandedHeightLabel')}
          value={appearance.expandedHeight}
          placeholder="100%"
          onChange={(v) => onChange({ expandedHeight: v })}
        />
        <TextRow
          id="aw-expanded-inset"
          label={t('aiWidgetAppearance.expandedInsetLabel')}
          value={appearance.expandedInset}
          placeholder="0px"
          onChange={(v) => onChange({ expandedInset: v })}
        />
        <div />
        <ToggleRow
          id="aw-disable-media"
          label={t('aiWidgetAppearance.disableMediaLabel')}
          checked={appearance.disableMedia}
          onChange={(v) => onChange({ disableMedia: v })}
        />
        <ToggleRow
          id="aw-allow-fullscreen"
          label={t('aiWidgetAppearance.allowFullscreenLabel')}
          checked={appearance.allowFullscreen}
          onChange={(v) => onChange({ allowFullscreen: v })}
        />
        <ToggleRow
          id="aw-start-fullscreen"
          label={t('aiWidgetAppearance.startFullscreenLabel')}
          checked={appearance.startFullscreen}
          onChange={(v) => onChange({ startFullscreen: v })}
        />
      </Section>

      <Section title={t('aiWidgetAppearance.sectionLauncher')}>
        <TextRow
          id="aw-launcher-icon"
          label={t('aiWidgetAppearance.launcherIconLabel')}
          value={appearance.launcherIcon}
          placeholder="https://…"
          onChange={(v) => onChange({ launcherIcon: v })}
          full
        />
        <ColorRow
          id="aw-gradient-start"
          label={t('aiWidgetAppearance.launcherGradientStartLabel')}
          value={gradStart ? `#${gradStart.replace(/^#/, '')}` : ''}
          fallback="#6e72fc"
          resetLabel={t('aiWidgetAppearance.resetColor')}
          onChange={(v) => setGradient(v, gradEnd ? `#${gradEnd.replace(/^#/, '')}` : '#ad1deb')}
        />
        <ColorRow
          id="aw-gradient-end"
          label={t('aiWidgetAppearance.launcherGradientEndLabel')}
          value={gradEnd ? `#${gradEnd.replace(/^#/, '')}` : ''}
          fallback="#ad1deb"
          resetLabel={t('aiWidgetAppearance.resetColor')}
          onChange={(v) => setGradient(gradStart ? `#${gradStart.replace(/^#/, '')}` : '#6e72fc', v)}
        />
        <ToggleRow
          id="aw-flat-launcher"
          label={t('aiWidgetAppearance.flatLauncherLabel')}
          checked={appearance.flatLauncher}
          onChange={(v) => onChange({ flatLauncher: v })}
        />
        <SliderRow
          id="aw-launcher-size"
          label={t('aiWidgetAppearance.launcherSizeLabel')}
          value={appearance.launcherSize}
          min={40}
          max={88}
          step={4}
          unit="px"
          onChange={(v) => onChange({ launcherSize: v })}
        />
        <ToggleRow
          id="aw-launcher-glow"
          label={t('aiWidgetAppearance.launcherGlowLabel')}
          checked={appearance.launcherGlow}
          onChange={(v) => onChange({ launcherGlow: v })}
        />
        <TextRow
          id="aw-cta-text"
          label={t('aiWidgetAppearance.ctaTextLabel')}
          value={appearance.ctaText}
          placeholder={t('aiWidgetAppearance.ctaTextPlaceholder')}
          onChange={(v) => onChange({ ctaText: v })}
        />
        <NumberRow
          id="aw-cta-delay"
          label={t('aiWidgetAppearance.ctaDelayLabel')}
          value={appearance.ctaDelay}
          onChange={(v) => onChange({ ctaDelay: v })}
        />
        <ToggleRow
          id="aw-cta-sparkle"
          label={t('aiWidgetAppearance.ctaSparkleLabel')}
          checked={appearance.ctaSparkle}
          onChange={(v) => onChange({ ctaSparkle: v })}
        />
      </Section>
    </div>
  );
}
