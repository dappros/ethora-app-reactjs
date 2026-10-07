import { CSSProperties, useEffect } from 'react';
import { useTranslation } from '../../../i18n/useTranslation';
import type { AiWidgetAppearance } from '../../../lib/aiWidgetAppearance';
import { Segmented } from './Fields';
import { useWidth } from './useWidth';
import {
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  WIDGET_DEFAULTS,
  readableOn,
  resolveLength,
  tint,
  toHex,
} from './options';

export type PreviewMode = 'launcher' | 'welcome' | 'chat';

interface Props {
  appearance: AiWidgetAppearance;
  botName?: string;
  mode: PreviewMode;
  onModeChange: (m: PreviewMode) => void;
}

// A static, instant mock of the embeddable assistant on a stand-in web page.
// Mirrors ai-assistant-ui's chrome (Assistant.tsx: launcher, teaser, header)
// closely enough to judge colors, copy, fonts and sizing while typing; the
// "Test widget" button above still runs the real bundle end to end.
const STAGE_HEIGHT = 560;
const BROWSER_BAR = 36;
const PAD = 16;

function useGoogleFont(name: string) {
  useEffect(() => {
    const family = name.trim();
    if (!family) return;
    const id = `aw-gfont-${family.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@400;600&display=swap`;
    document.head.appendChild(link);
  }, [name]);
}

function parseGradient(value: string): [string, string] | null {
  const parts = value.split(',').map((p) => toHex(p.trim()));
  return parts.length === 2 && parts[0] && parts[1] ? [parts[0], parts[1]] : null;
}

function cssFontSize(v: string): string {
  const t = v.trim();
  if (!t) return '15px';
  return /^\d+(\.\d+)?$/.test(t) ? `${t}px` : t;
}

const Icon = ({ d, size = 18, color }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICONS = {
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
  expand: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
  close: 'M18 6 6 18M6 6l12 12',
  attach: 'M21.4 11.1 12.2 20.3a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5',
  mic: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v3',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z',
};

// The widget's own launcher mark (ai-assistant-ui ChatGlyph).
const ChatGlyph = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
    <g fill="currentColor">
      <path d="M59.06 20.98c0 .85-.46 1.61-1.2 2.02l-10.42 5.7-5.7 10.42a2.3 2.3 0 0 1-2 1.2c-.85 0-1.61-.46-2.02-1.2l-5.7-10.42-10.4-5.7a2.27 2.27 0 0 1-1.2-2.02c0-.83.44-1.61 1.2-2l10.4-5.7 5.7-10.42c.8-1.47 3.24-1.47 4.02 0l5.7 10.42 10.42 5.7c.74.39 1.2 1.17 1.2 2z" />
      <path d="M68.77 52.41c0 .85-.46 1.61-1.2 2.02l-7.2 3.94-3.93 7.22a2.3 2.3 0 0 1-2.02 1.2c-.85 0-1.61-.46-2.03-1.2l-3.93-7.22-7.22-3.94a2.3 2.3 0 0 1-1.2-2.02c0-.83.46-1.61 1.2-2l7.22-3.96 3.93-7.2c.8-1.47 3.24-1.47 4.05 0l3.93 7.2 7.2 3.96c.74.39 1.2 1.17 1.2 2z" />
      <path d="M21.19 98.25a2.3 2.3 0 0 1-2.3-2.3V80.42a11.24 11.24 0 0 1-8.94-11V40.2c0-6.2 5.04-11.24 11.24-11.24h4.97a2.3 2.3 0 0 1 0 4.6h-4.97a6.65 6.65 0 0 0-6.64 6.64v29.21a6.65 6.65 0 0 0 6.64 6.64 2.3 2.3 0 0 1 2.3 2.3v12.4l15.54-14.1c.42-.39.97-.6 1.54-.6h38.24a6.65 6.65 0 0 0 6.64-6.64V40.2a6.65 6.65 0 0 0-6.64-6.64H53.76a2.3 2.3 0 0 1 0-4.6h25.05c6.2 0 11.24 5.04 11.24 11.24v29.21c0 6.2-5.04 11.24-11.24 11.24H41.46L22.74 97.65c-.43.4-.98.6-1.55.6z" />
    </g>
  </svg>
);

export function WidgetPreview({ appearance: a, botName, mode, onModeChange }: Props) {
  const { t } = useTranslation();
  const [stageRef, stageWidth] = useWidth<HTMLDivElement>();
  useGoogleFont(a.googleFont);

  const primary = toHex(a.primaryColor) || a.primaryColor || WIDGET_DEFAULTS.primary;
  const icons = a.iconsColor || primary;
  const ownBg = a.ownBubbleBg || a.secondaryColor || WIDGET_DEFAULTS.secondary;
  const otherBg = a.otherBubbleBg || WIDGET_DEFAULTS.otherBubble;
  const inputBg = a.inputBg || WIDGET_DEFAULTS.input;
  const fontFamily = a.fontFamily || (a.googleFont ? `'${a.googleFont}', sans-serif` : undefined);
  const fontSize = cssFontSize(a.fontSize);
  const title = a.title || botName || t('aiWidgetAppearance.previewBotName');
  const side = a.position === 'left' ? 'left' : 'right';

  const gradient = parseGradient(a.launcherGradient);
  const flat = !gradient && a.flatLauncher;
  const [gFrom, gTo] = gradient || [WIDGET_DEFAULTS.gradientFrom, WIDGET_DEFAULTS.gradientTo];
  const launcherBg = flat ? primary : `linear-gradient(135deg, ${gFrom}, ${gTo})`;
  const glow = flat ? primary : gTo;
  const glowSoft = `color-mix(in srgb, ${glow} 40%, transparent)`;
  const size = a.launcherSize || WIDGET_DEFAULTS.launcherSize;

  const popupW = Math.min(Math.max(resolveLength(a.width, 'w', DEFAULT_WIDTH), 260), 720);
  const popupH = Math.min(Math.max(resolveLength(a.height, 'h', DEFAULT_HEIGHT), 320), 900);
  const availW = Math.max(stageWidth - PAD * 2, 1);
  const availH = STAGE_HEIGHT - BROWSER_BAR - PAD * 2;
  const scale = stageWidth ? Math.min(1, availW / popupW, availH / popupH) : 1;

  const avatar = a.launcherIcon ? (
    <img src={a.launcherIcon} alt="" className="size-full object-cover" />
  ) : (
    title.slice(0, 1).toUpperCase()
  );

  const bubble = (own: boolean): CSSProperties => ({
    background: own ? ownBg : otherBg,
    color: readableOn(own ? ownBg : otherBg),
    borderRadius: own ? '16px 16px 6px 16px' : '16px 16px 16px 6px',
    padding: '9px 13px',
    maxWidth: '78%',
    lineHeight: 1.4,
    alignSelf: own ? 'flex-end' : 'flex-start',
  });

  const botRow = (text: string) => (
    <div className="flex items-end gap-2">
      <span
        className="size-7 shrink-0 rounded-full inline-flex items-center justify-center text-xs font-semibold overflow-hidden"
        style={{ background: tint(primary, 0.82), color: primary }}
      >
        {avatar}
      </span>
      <div style={bubble(false)}>{text}</div>
    </div>
  );

  const popup = (
    <div
      className="absolute flex flex-col overflow-hidden"
      style={{
        width: popupW,
        height: popupH,
        bottom: PAD,
        [side]: PAD,
        transform: `scale(${scale})`,
        transformOrigin: `bottom ${side}`,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
        fontFamily,
        color: '#141414',
      }}
    >
      <header className="flex items-center justify-between gap-2 shrink-0" style={{ padding: '12px 14px', background: primary, color: '#fff' }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="size-8 shrink-0 rounded-full inline-flex items-center justify-center font-semibold overflow-hidden" style={{ background: 'rgba(255,255,255,0.25)', fontSize: 15 }}>
            {avatar}
          </span>
          <span className="truncate" style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 opacity-90">
          <Icon d={ICONS.globe} size={17} />
          {a.allowFullscreen && <Icon d={ICONS.expand} size={17} />}
          <Icon d={ICONS.close} size={19} />
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col gap-3 p-4 overflow-hidden" style={{ fontSize }}>
        {mode === 'welcome' ? (
          <div className="m-auto flex flex-col items-center text-center gap-3 px-2">
            <span className="size-14 rounded-2xl inline-flex items-center justify-center" style={{ background: tint(icons, 0.85), color: icons }}>
              <ChatGlyph size={30} />
            </span>
            <div style={{ fontWeight: 600 }}>
              {a.greetingTitle || t('aiWidgetAppearance.previewEmptyTitle')}
            </div>
            <div style={{ fontSize: '0.875em', color: '#5a5f66' }}>
              {a.greeting || t('aiWidgetAppearance.previewEmptyBody').replace('{name}', title)}
            </div>
          </div>
        ) : (
          <>
            {botRow(a.greetingMessage || t('aiWidgetAppearance.previewGreeting'))}
            <div style={bubble(true)}>{t('aiWidgetAppearance.previewVisitorMessage')}</div>
            {botRow(t('aiWidgetAppearance.previewBotReply'))}
            <div className="flex items-center gap-1 pl-9" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-1.5 rounded-full aw-typing" style={{ background: '#9aa4b2', animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2 border-t" style={{ padding: 12, borderColor: '#eceff3' }}>
        {!a.disableMedia && (
          <span className="size-9 shrink-0 rounded-xl inline-flex items-center justify-center" style={{ background: tint(icons, 0.88) }}>
            <Icon d={ICONS.attach} size={17} color={icons} />
          </span>
        )}
        <div className="flex-1 min-w-0 rounded-xl border px-3 py-2 text-sm truncate" style={{ background: inputBg, borderColor: '#e6e8ec', color: '#9aa4b2' }}>
          {t('aiWidgetAppearance.previewInputPlaceholder')}
        </div>
        {!a.disableMedia && (
          <span className="size-9 shrink-0 rounded-xl inline-flex items-center justify-center" style={{ background: tint(icons, 0.88) }}>
            <Icon d={ICONS.mic} size={17} color={icons} />
          </span>
        )}
        <span className="size-9 shrink-0 rounded-xl inline-flex items-center justify-center" style={{ background: icons }}>
          <Icon d={ICONS.send} size={16} color={readableOn(toHex(icons) || '#1976d2')} />
        </span>
      </div>
    </div>
  );

  const showCta = !!a.ctaText;
  const launcher = (
    <div className="absolute flex flex-col" style={{ bottom: PAD + 8, [side]: PAD + 8, alignItems: side === 'left' ? 'flex-start' : 'flex-end', fontFamily }}>
      {showCta && (
        <div
          className="mb-3 whitespace-nowrap aw-teaser"
          style={{ background: '#fff', color: '#333', padding: '10px 14px', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontSize: 14, maxWidth: Math.max(stageWidth - 64, 120), overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {a.ctaSparkle ? '✨ ' : ''}
          {a.ctaText === WIDGET_DEFAULTS.cta ? t('aiWidgetAppearance.ctaTextPlaceholder') : a.ctaText}
        </div>
      )}
      <span
        className={a.launcherGlow ? 'aw-glow' : undefined}
        style={
          {
            width: size,
            height: size,
            borderRadius: '50%',
            background: launcherBg,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: `0 0 12px ${glowSoft}`,
            '--aw-glow-soft': glowSoft,
            '--aw-glow-strong': `color-mix(in srgb, ${glow} 80%, transparent)`,
          } as CSSProperties
        }
      >
        {a.launcherIcon ? (
          <img src={a.launcherIcon} alt="" className="size-full object-cover" />
        ) : (
          <ChatGlyph size={Math.round(size * 0.57)} />
        )}
      </span>
    </div>
  );

  return (
    <div>
      <style>{`
        @keyframes aw-pulse { 0%,100% { box-shadow: 0 0 12px var(--aw-glow-soft); } 50% { box-shadow: 0 0 24px var(--aw-glow-strong); } }
        .aw-glow { animation: aw-pulse 2.5s infinite; }
        @keyframes aw-dot { 0%,60%,100% { opacity: .35; } 30% { opacity: 1; } }
        .aw-typing { animation: aw-dot 1.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .aw-glow, .aw-typing { animation: none; } }
      `}</style>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="font-sans font-semibold text-sm">{t('aiWidgetAppearance.previewTitle')}</div>
        <Segmented<PreviewMode>
          size="sm"
          ariaLabel={t('aiWidgetAppearance.previewTitle')}
          value={mode}
          onChange={onModeChange}
          options={[
            { value: 'launcher', label: t('aiWidgetAppearance.previewModeLauncher') },
            { value: 'welcome', label: t('aiWidgetAppearance.previewModeWelcome') },
            { value: 'chat', label: t('aiWidgetAppearance.previewModeChat') },
          ]}
        />
      </div>
      <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-3" style={{ height: BROWSER_BAR, background: '#eef1f5' }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} className="size-2.5 rounded-full" style={{ background: c }} />
          ))}
          <span className="ml-2 flex-1 max-w-[220px] h-5 rounded-md text-[10px] leading-5 px-2 truncate" style={{ background: '#fff', color: '#8a94a1' }}>
            yourwebsite.com
          </span>
        </div>
        <div ref={stageRef} className="relative overflow-hidden" style={{ height: STAGE_HEIGHT - BROWSER_BAR, background: '#ffffff' }}>
          <div className="p-5 flex flex-col gap-3" aria-hidden="true">
            <div className="h-4 w-2/5 rounded-full" style={{ background: '#e5e7eb' }} />
            <div className="h-24 rounded-xl" style={{ background: '#f1f5f9' }} />
            <div className="h-3 w-4/5 rounded-full" style={{ background: '#eef1f5' }} />
            <div className="h-3 w-3/5 rounded-full" style={{ background: '#eef1f5' }} />
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 rounded-xl" style={{ background: '#f4f6f9' }} />
              ))}
            </div>
          </div>
          {mode === 'launcher' ? launcher : popup}
        </div>
      </div>
      <p className="font-sans text-xs text-gray-500 mt-2">
        {mode !== 'launcher' && scale < 0.995
          ? t('aiWidgetAppearance.previewScaled').replace('{n}', String(Math.round(scale * 100)))
          : t('aiWidgetAppearance.previewHint')}
      </p>
    </div>
  );
}
