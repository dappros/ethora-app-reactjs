import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Button } from '@mui/material';
import cn from 'classnames';
import { ReactNode, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { httpPostFile } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { AiWidgetAppearance } from '../../lib/aiWidgetAppearance';
import { IconArrowDown } from '../Icons/IconArrowDown';
import { ColorField } from './appearance/ColorField';
import {
  Card,
  SelectField,
  Segmented,
  SliderField,
  SwitchRow,
  TextField,
} from './appearance/Fields';
import {
  CUSTOM_FONT_ID,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  FONT_OPTIONS,
  GRADIENT_PRESETS,
  LOCALE_OPTIONS,
  SIZE_PRESETS,
  WIDGET_DEFAULTS,
  detectFontOption,
  getSwatches,
  getThemePresets,
  matchesPreset,
  resolveLength,
  toHex,
} from './appearance/options';
import { useWidth } from './appearance/useWidth';
import { PreviewMode, WidgetPreview } from './appearance/WidgetPreview';

interface Props {
  appearance: AiWidgetAppearance;
  onChange: (updates: Partial<AiWidgetAppearance>) => void;
  onSave: () => void;
  onReset: () => void;
  isDirty: boolean;
  // Inside the Website widget card's tab: no border or title of its own.
  embedded?: boolean;
  footer?: React.ReactNode;
  // The app's brand color, offered as a theme preset and a swatch.
  brandColor?: string | null;
  // The active agent's name: what the widget's header shows when no title is set.
  botName?: string;
}

type TabId = 'content' | 'style' | 'layout' | 'launcher';

const TAB_PREVIEW: Record<TabId, PreviewMode> = {
  content: 'chat',
  style: 'chat',
  layout: 'chat',
  launcher: 'launcher',
};

const TWO_COLUMN_MIN_WIDTH = 880;
const MAX_ICON_BYTES = 2 * 1024 * 1024;

function Advanced({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Disclosure as="div" className="mt-3">
      {({ open }) => (
        <>
          <DisclosureButton className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-brand-500 hover:underline">
            {title}
            <span className="transition-transform" style={{ transform: open ? 'rotate(180deg)' : undefined }}>
              <IconArrowDown width={14} height={14} />
            </span>
          </DisclosureButton>
          <DisclosurePanel className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}

export function AssistantAppearancePanel({
  appearance: a,
  onChange,
  onSave,
  onReset,
  isDirty,
  embedded = false,
  footer,
  brandColor,
  botName,
}: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabId>('content');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('chat');
  const [rootRef, rootWidth] = useWidth<HTMLDivElement>();
  const twoColumns = rootWidth >= TWO_COLUMN_MIN_WIDTH;

  const swatches = getSwatches(brandColor);
  const presets = getThemePresets(brandColor);

  const switchTab = (next: TabId) => {
    setTab(next);
    setPreviewMode(TAB_PREVIEW[next]);
  };

  // Editing a field nudges the preview to the screen that field shows on.
  const edit = (updates: Partial<AiWidgetAppearance>, mode?: PreviewMode) => {
    onChange(updates);
    if (mode) setPreviewMode(mode);
  };

  const tabs: Array<{ value: TabId; label: string }> = [
    { value: 'content', label: t('aiWidgetAppearance.tabContent') },
    { value: 'style', label: t('aiWidgetAppearance.tabStyle') },
    { value: 'layout', label: t('aiWidgetAppearance.tabLayout') },
    { value: 'launcher', label: t('aiWidgetAppearance.tabLauncher') },
  ];

  const form = (
    <div className="flex flex-col gap-4 min-w-0">
      <Segmented<TabId>
        ariaLabel={t('aiWidgetAppearance.title')}
        value={tab}
        onChange={switchTab}
        options={tabs}
      />
      {tab === 'content' && <ContentTab a={a} edit={edit} botName={botName} />}
      {tab === 'style' && (
        <StyleTab a={a} edit={edit} swatches={swatches} presets={presets} />
      )}
      {tab === 'layout' && <LayoutTab a={a} edit={edit} />}
      {tab === 'launcher' && <LauncherTab a={a} edit={edit} swatches={swatches} />}
    </div>
  );

  const preview = (
    <div className={cn(twoColumns && 'sticky top-4')}>
      <WidgetPreview appearance={a} botName={botName} mode={previewMode} onModeChange={setPreviewMode} />
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={embedded ? 'w-full p-4' : 'w-full border border-gray-200 rounded-xl bg-white p-4 mt-4'}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-[16rem]">
          {!embedded && (
            <div className="font-sans font-semibold text-base">{t('aiWidgetAppearance.title')}</div>
          )}
          <p className="font-sans text-xs text-gray-500 mt-1 max-w-xl">
            {t('aiWidgetAppearance.description')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isDirty && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 font-sans">
              <span className="size-2 rounded-full bg-amber-500" aria-hidden="true" />
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

      <div
        className={cn('grid gap-6 items-start', twoColumns ? 'grid-cols-[minmax(0,1fr)_minmax(340px,440px)]' : 'grid-cols-1')}
      >
        {form}
        {preview}
      </div>
      {footer}
    </div>
  );
}

type Edit = (updates: Partial<AiWidgetAppearance>, mode?: PreviewMode) => void;

function ContentTab({ a, edit, botName }: { a: AiWidgetAppearance; edit: Edit; botName?: string }) {
  const { t } = useTranslation();
  const localeOptions = [
    { value: '', label: t('aiWidgetAppearance.localeAuto') },
    ...LOCALE_OPTIONS.map((o) => ({ value: o.code, label: `${o.label} (${o.code})` })),
  ];
  if (a.locale && !LOCALE_OPTIONS.some((o) => o.code === a.locale)) {
    localeOptions.push({ value: a.locale, label: a.locale });
  }

  return (
    <>
      <Card title={t('aiWidgetAppearance.cardHeader')}>
        <TextField
          label={t('aiWidgetAppearance.titleLabel')}
          hint={t('aiWidgetAppearance.titleHint')}
          value={a.title}
          placeholder={botName || t('aiWidgetAppearance.titlePlaceholder')}
          onChange={(v) => edit({ title: v }, 'chat')}
          maxLength={60}
        />
      </Card>
      <Card title={t('aiWidgetAppearance.cardGreeting')} description={t('aiWidgetAppearance.cardGreetingHint')}>
        <TextField
          multiline
          label={t('aiWidgetAppearance.greetingMessageLabel')}
          value={a.greetingMessage}
          placeholder={t('aiWidgetAppearance.previewGreeting')}
          onChange={(v) => edit({ greetingMessage: v }, 'chat')}
          maxLength={280}
        />
      </Card>
      <Card title={t('aiWidgetAppearance.cardWelcome')} description={t('aiWidgetAppearance.cardWelcomeHint')}>
        <div className="grid grid-cols-1 gap-3">
          <TextField
            label={t('aiWidgetAppearance.greetingTitleLabel')}
            value={a.greetingTitle}
            placeholder={t('aiWidgetAppearance.previewEmptyTitle')}
            onChange={(v) => edit({ greetingTitle: v }, 'welcome')}
            maxLength={80}
          />
          <TextField
            label={t('aiWidgetAppearance.greetingLabel')}
            value={a.greeting}
            placeholder={t('aiWidgetAppearance.previewEmptyBody').replace('{name}', botName || t('aiWidgetAppearance.previewBotName'))}
            onChange={(v) => edit({ greeting: v }, 'welcome')}
            maxLength={160}
          />
        </div>
      </Card>
      <Card title={t('aiWidgetAppearance.cardLanguage')}>
        <SelectField
          label={t('aiWidgetAppearance.localeLabel')}
          hint={t('aiWidgetAppearance.localeHint')}
          value={a.locale}
          onChange={(v) => edit({ locale: v })}
          options={localeOptions}
        />
        <div className="mt-2">
          <SwitchRow
            label={t('aiWidgetAppearance.hideSystemMessagesLabel')}
            description={t('aiWidgetAppearance.hideSystemMessagesHint')}
            checked={a.hideSystemMessages}
            onChange={(v) => edit({ hideSystemMessages: v })}
          />
        </div>
      </Card>
    </>
  );
}

function PresetSwatch({ p, brandFallback }: { p: ReturnType<typeof getThemePresets>[number]; brandFallback: string }) {
  const primary = toHex(p.fields.primaryColor) || brandFallback;
  const own = toHex(p.fields.ownBubbleBg) || WIDGET_DEFAULTS.secondary;
  const other = toHex(p.fields.otherBubbleBg) || WIDGET_DEFAULTS.otherBubble;
  const grad = p.fields.launcherGradient.split(',').map((c) => toHex(c));
  const launcher =
    grad.length === 2 && grad[0] && grad[1]
      ? `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`
      : p.fields.flatLauncher
        ? primary
        : `linear-gradient(135deg, ${WIDGET_DEFAULTS.gradientFrom}, ${WIDGET_DEFAULTS.gradientTo})`;
  return (
    <span className="relative block h-16 rounded-lg overflow-hidden border border-gray-200" style={{ background: '#fff' }} aria-hidden="true">
      <span className="block h-4" style={{ background: primary }} />
      <span className="absolute left-2 top-6 h-2.5 w-10 rounded-full" style={{ background: other }} />
      <span className="absolute right-2 top-10 h-2.5 w-8 rounded-full" style={{ background: own }} />
      <span className="absolute left-2 bottom-1.5 size-3.5 rounded-full" style={{ background: launcher }} />
    </span>
  );
}

function StyleTab({
  a,
  edit,
  swatches,
  presets,
}: {
  a: AiWidgetAppearance;
  edit: Edit;
  swatches: string[];
  presets: ReturnType<typeof getThemePresets>;
}) {
  const { t } = useTranslation();
  const fontId = detectFontOption(a);
  const [showCustomFont, setShowCustomFont] = useState(fontId === CUSTOM_FONT_ID);
  const selectedFont = showCustomFont ? CUSTOM_FONT_ID : fontId;
  const fontLabel = (id: string, label: string) =>
    id === 'default'
      ? t('aiWidgetAppearance.fontDefault')
      : id === 'system'
        ? t('aiWidgetAppearance.fontSystem')
        : label;

  const color = (
    key: 'primaryColor' | 'iconsColor' | 'ownBubbleBg' | 'otherBubbleBg' | 'inputBg' | 'secondaryColor',
    label: string,
    fallback: string,
    hint?: string
  ) => (
    <ColorField
      label={label}
      hint={hint}
      value={a[key]}
      fallback={fallback}
      swatches={swatches}
      onChange={(v) => edit({ [key]: v } as Partial<AiWidgetAppearance>, 'chat')}
    />
  );

  const primaryFallback = toHex(a.primaryColor) || WIDGET_DEFAULTS.primary;

  return (
    <>
      <Card title={t('aiWidgetAppearance.cardTheme')} description={t('aiWidgetAppearance.cardThemeHint')}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((p) => {
            const active = matchesPreset(a, p);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => edit({ ...p.fields }, 'chat')}
                aria-pressed={active}
                className={cn(
                  'text-left p-1.5 rounded-xl border-2 transition-colors',
                  active ? 'border-brand-500' : 'border-transparent hover:border-gray-300'
                )}
              >
                <PresetSwatch p={p} brandFallback={WIDGET_DEFAULTS.primary} />
                <span className="flex items-center justify-between mt-1.5 px-0.5 font-sans text-xs font-medium">
                  {t(p.labelKey)}
                  {active && <span className="text-brand-500" aria-hidden="true">✓</span>}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title={t('aiWidgetAppearance.sectionTheme')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {color('primaryColor', t('aiWidgetAppearance.primaryColorLabel'), WIDGET_DEFAULTS.primary, t('aiWidgetAppearance.primaryColorHint'))}
          {color('iconsColor', t('aiWidgetAppearance.iconsColorLabel'), primaryFallback, t('aiWidgetAppearance.iconsColorHint'))}
          {color('ownBubbleBg', t('aiWidgetAppearance.ownBubbleBgLabel'), toHex(a.secondaryColor) || WIDGET_DEFAULTS.secondary)}
          {color('otherBubbleBg', t('aiWidgetAppearance.otherBubbleBgLabel'), WIDGET_DEFAULTS.otherBubble)}
          {color('inputBg', t('aiWidgetAppearance.inputBgLabel'), WIDGET_DEFAULTS.input)}
          {color('secondaryColor', t('aiWidgetAppearance.secondaryColorLabel'), WIDGET_DEFAULTS.secondary, t('aiWidgetAppearance.secondaryColorHint'))}
        </div>
      </Card>

      <Card title={t('aiWidgetAppearance.cardTypography')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label={t('aiWidgetAppearance.fontFamilyLabel')}
            value={selectedFont}
            onChange={(id) => {
              if (id === CUSTOM_FONT_ID) {
                setShowCustomFont(true);
                return;
              }
              setShowCustomFont(false);
              const o = FONT_OPTIONS.find((f) => f.id === id);
              if (o) edit({ fontFamily: o.fontFamily, googleFont: o.googleFont }, 'chat');
            }}
            options={[
              ...FONT_OPTIONS.map((o) => ({ value: o.id, label: fontLabel(o.id, o.label) })),
              { value: CUSTOM_FONT_ID, label: t('aiWidgetAppearance.fontCustom') },
            ]}
          />
          <div>
            <SliderField
              label={t('aiWidgetAppearance.fontSizeLabel')}
              value={parseInt(a.fontSize, 10) || 15}
              min={12}
              max={20}
              format={(v) => (a.fontSize ? `${v}px` : t('aiWidgetAppearance.defaultShort'))}
              onChange={(v) => edit({ fontSize: String(v) }, 'chat')}
            />
            {a.fontSize && (
              <button type="button" onClick={() => edit({ fontSize: '' })} className="font-sans text-xs text-brand-500 hover:underline">
                {t('aiWidgetAppearance.useDefaultSize')}
              </button>
            )}
          </div>
          {showCustomFont && (
            <>
              <TextField
                label={t('aiWidgetAppearance.fontFamilyCssLabel')}
                value={a.fontFamily}
                placeholder={t('aiWidgetAppearance.fontFamilyPlaceholder')}
                onChange={(v) => edit({ fontFamily: v }, 'chat')}
              />
              <TextField
                label={t('aiWidgetAppearance.googleFontLabel')}
                value={a.googleFont}
                placeholder={t('aiWidgetAppearance.googleFontPlaceholder')}
                onChange={(v) => edit({ googleFont: v }, 'chat')}
              />
            </>
          )}
        </div>
      </Card>
    </>
  );
}

function LayoutTab({ a, edit }: { a: AiWidgetAppearance; edit: Edit }) {
  const { t } = useTranslation();
  const activeSize = SIZE_PRESETS.find((p) => p.width === a.width && p.height === a.height);
  const dims = (w: string, h: string) =>
    `${Math.round(resolveLength(w, 'w', DEFAULT_WIDTH))} × ${Math.round(resolveLength(h, 'h', DEFAULT_HEIGHT))}`;

  return (
    <>
      <Card title={t('aiWidgetAppearance.positionLabel')}>
        <Segmented<'left' | 'right'>
          ariaLabel={t('aiWidgetAppearance.positionLabel')}
          value={a.position}
          onChange={(v) => edit({ position: v }, 'chat')}
          options={[
            { value: 'left', label: t('aiWidgetAppearance.positionLeft') },
            { value: 'right', label: t('aiWidgetAppearance.positionRight') },
          ]}
        />
      </Card>

      <Card title={t('aiWidgetAppearance.cardSize')} description={t('aiWidgetAppearance.cardSizeHint')}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SIZE_PRESETS.map((p) => {
            const active = activeSize?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => edit({ width: p.width, height: p.height }, 'chat')}
                className={cn(
                  'text-left px-3 py-2 rounded-xl border-2 transition-colors',
                  active ? 'border-brand-500 bg-brand-150' : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <span className="block font-sans text-sm font-medium">{t(p.labelKey)}</span>
                <span className="block font-mono text-[11px] text-gray-500">{dims(p.width, p.height)}</span>
              </button>
            );
          })}
          {!activeSize && (
            <div className="px-3 py-2 rounded-xl border-2 border-brand-500 bg-brand-150">
              <span className="block font-sans text-sm font-medium">{t('aiWidgetAppearance.sizePresetCustom')}</span>
              <span className="block font-mono text-[11px] text-gray-500">{dims(a.width, a.height)}</span>
            </div>
          )}
        </div>
        <Advanced title={t('aiWidgetAppearance.customSize')}>
          <TextField label={t('aiWidgetAppearance.widthLabel')} hint={t('aiWidgetAppearance.lengthHint')} value={a.width} placeholder={DEFAULT_WIDTH} onChange={(v) => edit({ width: v }, 'chat')} />
          <TextField label={t('aiWidgetAppearance.heightLabel')} hint={t('aiWidgetAppearance.lengthHint')} value={a.height} placeholder={DEFAULT_HEIGHT} onChange={(v) => edit({ height: v }, 'chat')} />
        </Advanced>
      </Card>

      <Card title={t('aiWidgetAppearance.cardBehaviour')}>
        <div className="divide-y divide-gray-100">
          <SwitchRow
            label={t('aiWidgetAppearance.allowMediaLabel')}
            description={t('aiWidgetAppearance.allowMediaHint')}
            checked={!a.disableMedia}
            onChange={(v) => edit({ disableMedia: !v }, 'chat')}
          />
          <SwitchRow
            label={t('aiWidgetAppearance.allowFullscreenLabel')}
            checked={a.allowFullscreen}
            onChange={(v) => edit({ allowFullscreen: v, ...(v ? {} : { startFullscreen: false }) }, 'chat')}
          />
          <SwitchRow
            label={t('aiWidgetAppearance.startFullscreenLabel')}
            checked={a.startFullscreen}
            disabled={!a.allowFullscreen}
            onChange={(v) => edit({ startFullscreen: v })}
          />
        </div>
        {a.allowFullscreen && (
          <Advanced title={t('aiWidgetAppearance.expandedSizing')}>
            <TextField label={t('aiWidgetAppearance.expandedWidthLabel')} value={a.expandedWidth} placeholder="100%" onChange={(v) => edit({ expandedWidth: v })} />
            <TextField label={t('aiWidgetAppearance.expandedHeightLabel')} value={a.expandedHeight} placeholder="100%" onChange={(v) => edit({ expandedHeight: v })} />
            <TextField label={t('aiWidgetAppearance.expandedInsetLabel')} hint={t('aiWidgetAppearance.expandedInsetHint')} value={a.expandedInset} placeholder="0px" onChange={(v) => edit({ expandedInset: v })} />
          </Advanced>
        )}
      </Card>
    </>
  );
}

function LauncherTab({ a, edit, swatches }: { a: AiWidgetAppearance; edit: Edit; swatches: string[] }) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const solid = a.flatLauncher && !a.launcherGradient;
  const [gFrom, gTo]: [string, string] = (() => {
    const [f, to] = a.launcherGradient.split(',').map((c) => toHex(c.trim()));
    return f && to ? [f, to] : ['', ''];
  })();
  const setGradient = (from: string, to: string) => {
    const f = (toHex(from) || WIDGET_DEFAULTS.gradientFrom).replace('#', '');
    const tt = (toHex(to) || WIDGET_DEFAULTS.gradientTo).replace('#', '');
    edit({ launcherGradient: `${f},${tt}`, flatLauncher: false }, 'launcher');
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('aiWidgetAppearance.iconNotImage'));
      return;
    }
    if (file.size > MAX_ICON_BYTES) {
      toast.error(t('aiWidgetAppearance.iconTooLarge'));
      return;
    }
    setUploading(true);
    try {
      const resp = await httpPostFile(file);
      const location = resp.data?.results?.[0]?.location;
      if (!location) throw new Error('Upload returned no location');
      edit({ launcherIcon: location }, 'launcher');
    } catch {
      toast.error(t('aiWidgetAppearance.iconUploadFailed'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <>
      <Card title={t('aiWidgetAppearance.cardLauncherButton')}>
        <Segmented<'gradient' | 'solid'>
          ariaLabel={t('aiWidgetAppearance.launcherStyleLabel')}
          value={solid ? 'solid' : 'gradient'}
          onChange={(v) =>
            v === 'solid'
              ? edit({ flatLauncher: true, launcherGradient: '' }, 'launcher')
              : edit({ flatLauncher: false }, 'launcher')
          }
          options={[
            { value: 'gradient', label: t('aiWidgetAppearance.launcherStyleGradient') },
            { value: 'solid', label: t('aiWidgetAppearance.launcherStyleSolid') },
          ]}
        />
        {solid ? (
          <p className="font-sans text-xs text-gray-500 mt-3">{t('aiWidgetAppearance.launcherSolidHint')}</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mt-3">
              {GRADIENT_PRESETS.map(([from, to]) => {
                const active =
                  (gFrom || WIDGET_DEFAULTS.gradientFrom) === from && (gTo || WIDGET_DEFAULTS.gradientTo) === to;
                return (
                  <button
                    key={`${from}${to}`}
                    type="button"
                    title={`${from} → ${to}`}
                    onClick={() => setGradient(from, to)}
                    className={cn('size-8 rounded-full border-2', active ? 'border-brand-500' : 'border-transparent')}
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                  />
                );
              })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <ColorField
                label={t('aiWidgetAppearance.launcherGradientStartLabel')}
                value={gFrom}
                fallback={WIDGET_DEFAULTS.gradientFrom}
                swatches={swatches}
                onChange={(v) => setGradient(v, gTo || WIDGET_DEFAULTS.gradientTo)}
              />
              <ColorField
                label={t('aiWidgetAppearance.launcherGradientEndLabel')}
                value={gTo}
                fallback={WIDGET_DEFAULTS.gradientTo}
                swatches={swatches}
                onChange={(v) => setGradient(gFrom || WIDGET_DEFAULTS.gradientFrom, v)}
              />
            </div>
          </>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3">
          <SliderField
            label={t('aiWidgetAppearance.launcherSizeLabel')}
            value={a.launcherSize}
            min={40}
            max={88}
            step={4}
            format={(v) => `${v}px`}
            onChange={(v) => edit({ launcherSize: v }, 'launcher')}
          />
          <SwitchRow
            label={t('aiWidgetAppearance.launcherGlowLabel')}
            checked={a.launcherGlow}
            onChange={(v) => edit({ launcherGlow: v }, 'launcher')}
          />
        </div>
      </Card>

      <Card title={t('aiWidgetAppearance.cardLauncherIcon')} description={t('aiWidgetAppearance.launcherIconHint')}>
        <div className="flex items-center gap-3">
          <span className="size-12 shrink-0 rounded-full bg-gray-100 border border-gray-200 overflow-hidden inline-flex items-center justify-center text-xs text-gray-400">
            {a.launcherIcon ? <img src={a.launcherIcon} alt="" className="size-full object-cover" /> : t('aiWidgetAppearance.defaultShort')}
          </span>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          <Button size="small" variant="outlined" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? t('aiWidgetAppearance.iconUploading') : t('aiWidgetAppearance.iconUpload')}
          </Button>
          {a.launcherIcon && (
            <Button size="small" variant="text" color="inherit" onClick={() => edit({ launcherIcon: '' }, 'launcher')}>
              {t('aiWidgetAppearance.iconRemove')}
            </Button>
          )}
        </div>
        <Advanced title={t('aiWidgetAppearance.iconFromUrl')}>
          <TextField
            className="sm:col-span-2"
            label={t('aiWidgetAppearance.launcherIconLabel')}
            value={a.launcherIcon}
            placeholder="https://…"
            onChange={(v) => edit({ launcherIcon: v }, 'launcher')}
          />
        </Advanced>
      </Card>

      <Card title={t('aiWidgetAppearance.cardTeaser')} description={t('aiWidgetAppearance.cardTeaserHint')}>
        <SwitchRow
          label={t('aiWidgetAppearance.showTeaserLabel')}
          checked={!!a.ctaText}
          onChange={(v) => edit({ ctaText: v ? WIDGET_DEFAULTS.cta : '' }, 'launcher')}
        />
        {!!a.ctaText && (
          <div className="grid grid-cols-1 gap-3 mt-2">
            <TextField
              label={t('aiWidgetAppearance.ctaTextLabel')}
              value={a.ctaText === WIDGET_DEFAULTS.cta ? '' : a.ctaText}
              placeholder={t('aiWidgetAppearance.ctaTextPlaceholder')}
              onChange={(v) => edit({ ctaText: v || WIDGET_DEFAULTS.cta }, 'launcher')}
              maxLength={60}
            />
            <SliderField
              label={t('aiWidgetAppearance.ctaDelayLabel')}
              value={a.ctaDelay}
              min={0}
              max={10000}
              step={500}
              format={(v) => `${(v / 1000).toFixed(1)}s`}
              onChange={(v) => edit({ ctaDelay: v }, 'launcher')}
            />
            <SwitchRow
              label={t('aiWidgetAppearance.ctaSparkleLabel')}
              checked={a.ctaSparkle}
              onChange={(v) => edit({ ctaSparkle: v }, 'launcher')}
            />
          </div>
        )}
      </Card>
    </>
  );
}
