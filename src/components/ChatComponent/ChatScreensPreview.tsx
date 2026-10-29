import hexToRgba from 'hex-to-rgba';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import {
  ChatConfigRecord,
  featureOfKey,
  hasChatFeature,
} from '../../lib/chatComponentConfig';
import { Segmented } from '../AIWidget/appearance/Fields';
import { DevicePreviewStage, PhoneStatusBar } from '../Appearance/DeviceFrames';
import { DESKTOP_SCREEN, PHONE_SCREEN } from '../Appearance/deviceScreens';

type PreviewTheme = 'light' | 'dark';

interface Props {
  config: ChatConfigRecord;
  features: string[] | undefined;
  brandColor?: string | null;
  url?: string;
}

const FALLBACK_PRIMARY = '#0052cd';

function tint(color: string, alpha: number, fallback: string) {
  try {
    return hexToRgba(color, alpha);
  } catch {
    return fallback;
  }
}

const PATH = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4-4',
  more: 'M12 5v.01M12 12v.01M12 19v.01',
  burger: 'M4 6h16M4 12h16M4 18h16',
  globe:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18',
  clip: 'm21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.3 3.3 0 0 1 4.7 4.7L10 17.5a1.7 1.7 0 0 1-2.4-2.4L15 7.8',
  smile:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8.5 14a4.5 4.5 0 0 0 7 0M9 9.5v.01M15 9.5v.01',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
  compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm3.5 5.5-2 5-5 2 2-5z',
  plusCircle: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v8M8 12h8',
  back: 'M19 12H5m6-6-6 6 6 6',
  check: 'm2 12 5 5L18 6m-4 11 1 1L22 6',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
};

function Icon({
  d,
  size = 24,
  color,
}: {
  d: string;
  size?: number;
  color: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const AVATAR_COLORS: Record<string, { bg: string; fg: string }> = {
  TC: { bg: '#f8d0dc', fg: '#141414' },
  AL: { bg: '#cfe3ff', fg: '#141414' },
  SP: { bg: '#cdeccf', fg: '#141414' },
  DS: { bg: '#e6f5b8', fg: '#141414' },
  MK: { bg: '#f8d0dc', fg: '#141414' },
};

function Avatar({ initials, size }: { initials: string; size: number }) {
  const c = AVATAR_COLORS[initials] || AVATAR_COLORS.AL;
  return (
    <div
      className="shrink-0 grid place-items-center rounded-full font-bold"
      style={{
        width: size,
        height: size,
        background: c.bg,
        color: c.fg,
        fontSize: size * 0.38,
      }}
    >
      {initials}
    </div>
  );
}

export function ChatScreensPreview({
  config: c,
  features,
  brandColor,
  url = 'chat.example.com',
}: Props) {
  const { t } = useTranslation();
  const scheme = c.colorScheme === 'dark' ? 'dark' : 'light';
  const [theme, setTheme] = useState<PreviewTheme>(scheme);
  // Picking a fixed scheme in the settings switches the preview to it.
  useEffect(() => setTheme(scheme), [scheme]);
  const dark = theme === 'dark';

  // Only what the license covers is shown, the same as in the saved config.
  const on = (key: string) =>
    c[key] === true && hasChatFeature(features, featureOfKey(key));
  const off = (key: string) => c[key] === true;
  const str = (key: string, fallback: string) =>
    typeof c[key] === 'string' && c[key] ? (c[key] as string) : fallback;

  const primary = str('colors.primary', brandColor || FALLBACK_PRIMARY);
  const icons = str('colors.icons', primary);
  const text = dark ? '#f2f3f5' : '#141414';
  const muted = dark ? '#a3a8b4' : '#6b7280';
  const border = dark ? '#2c2f36' : '#e6e8ec';
  const surface = dark ? '#1c1e23' : '#ffffff';
  const online = dark ? '#5bd68c' : '#1f9d55';
  const chatBg = str('backgroundChat.color', dark ? '#17191d' : '#f3f6fb');
  const ownBg = str(
    'colors.ownMessageBackground',
    tint(primary, dark ? 0.28 : 0.16, dark ? '#1e3a52' : '#dbe8f8')
  );
  const otherBg = str(
    'colors.otherMessageBackground',
    dark ? '#1f2126' : '#ffffff'
  );
  const inputBg = str('colors.inputBackground', dark ? '#17191d' : '#ffffff');
  const iconsBg = str('colors.iconsBg', dark ? '#24272d' : '#f1f3f6');
  const size = Number.parseFloat(str('typography.fontSize', '16')) || 16;
  const family = str(
    'typography.fontFamily',
    "'Open Sans', system-ui, sans-serif"
  );

  const showHeader = !off('disableHeader');
  const showRooms = !off('disableRooms');
  const showMedia = !off('disableMedia');
  const showCount = !off('disableUserCount');
  const showSearch = !c['chatHeaderSettings.hideSearch'];
  const aiTyping = on('customTypingIndicator.enabled');
  const showTyping = aiTyping || !off('disableTypingIndicator');
  const blocked = aiTyping && on('blockMessageSendingWhenProcessing');

  const DateDivider = ({ label, pill }: { label: string; pill?: boolean }) => (
    <div className="flex items-center gap-4 my-1">
      <div className="flex-1 h-px" style={{ background: border }} />
      <span
        className="rounded-full font-semibold"
        style={{
          fontSize: size * 0.85,
          color: primary,
          padding: '2px 12px',
          background: pill ? tint(primary, 0.12, iconsBg) : 'transparent',
        }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: border }} />
    </div>
  );

  const Bubble = ({
    own,
    name,
    children,
    time,
    mobile,
  }: {
    own?: boolean;
    name?: string;
    children: ReactNode;
    time: string;
    mobile?: boolean;
  }) => (
    <div
      className="flex flex-col max-w-[70%]"
      style={{
        background: own ? ownBg : otherBg,
        color: text,
        border:
          !own && !mobile ? `1px solid ${border}` : '1px solid transparent',
        borderRadius: own ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '10px 16px',
        fontSize: size,
        lineHeight: 1.4,
        boxShadow: mobile && !own ? '0 1px 2px rgba(0,0,0,0.04)' : undefined,
      }}
    >
      {name && (
        <span
          className="font-semibold"
          style={{ color: primary, fontSize: size * 1.15, marginBottom: 4 }}
        >
          {name}
        </span>
      )}
      <div className="flex items-end gap-4">
        <span className="flex-1">{children}</span>
        <span
          className="shrink-0 flex items-center gap-1"
          style={{ fontSize: size * 0.75, color: muted }}
        >
          {time}
          {own && <Icon d={PATH.check} size={14} color={primary} />}
        </span>
      </div>
    </div>
  );

  const Photo = ({ width, height }: { width: number; height: number }) => (
    <div
      className="rounded-2xl"
      style={{
        width,
        height,
        background: `linear-gradient(135deg, ${tint(primary, 0.55, '#9ec5fe')}, #c7b7ff 55%, #ffd1a8)`,
      }}
      aria-label="Photo"
    />
  );

  const typing = showTyping && (
    <div style={{ fontSize: size * 0.85, color: muted, paddingLeft: 56 }}>
      {aiTyping
        ? str('customTypingIndicator.text', 'Thinking...')
        : 'Alex is typing...'}
    </div>
  );

  const messages = (mobile: boolean) => (
    <div
      className="flex-1 min-h-0 flex flex-col justify-end gap-3"
      style={{ padding: mobile ? '12px 16px' : '16px 24px' }}
    >
      <DateDivider label="Yesterday" pill={mobile} />
      <div className="flex items-end gap-3">
        <Avatar initials="AL" size={mobile ? 40 : 44} />
        <Bubble name="Alex Lee" time="17:41" mobile={mobile}>
          Is the demo still at 3?
        </Bubble>
      </div>
      <div className="flex justify-end">
        <Bubble own time="17:47" mobile={mobile}>
          Yes, I'll share the link
        </Bubble>
      </div>
      <DateDivider label="Today" pill={mobile} />
      {showMedia && (
        <div className="flex items-end gap-3">
          <Avatar initials="MK" size={mobile ? 40 : 44} />
          <div
            className="rounded-2xl p-1.5"
            style={{
              background: otherBg,
              border: mobile ? undefined : `1px solid ${border}`,
            }}
          >
            <Photo width={mobile ? 200 : 280} height={mobile ? 130 : 170} />
          </div>
        </div>
      )}
      <div className="flex items-end gap-3">
        <Avatar initials="AL" size={mobile ? 40 : 44} />
        <Bubble name="Alex Lee" time="10:45" mobile={mobile}>
          Great, see you there!
        </Bubble>
      </div>
      {typing}
    </div>
  );

  const composer = (mobile: boolean) => (
    <div
      className="flex items-center gap-3 shrink-0"
      style={{
        padding: mobile ? '12px 16px 28px' : '12px 24px',
        background: mobile ? surface : chatBg,
        borderRadius: mobile ? '24px 24px 0 0' : undefined,
      }}
    >
      {showMedia && (
        <span
          className="grid place-items-center rounded-xl shrink-0"
          style={{
            width: 48,
            height: 48,
            background: mobile ? 'transparent' : iconsBg,
          }}
        >
          <Icon d={PATH.clip} color={icons} />
        </span>
      )}
      {!mobile && (
        <span
          className="grid place-items-center rounded-xl shrink-0"
          style={{ width: 48, height: 48, background: iconsBg }}
        >
          <Icon d={PATH.smile} color={icons} />
        </span>
      )}
      <div
        className="flex-1 min-w-0 flex items-center"
        style={{
          height: 52,
          padding: '0 16px',
          background: mobile ? iconsBg : inputBg,
          border: mobile ? 'none' : `2px solid ${primary}`,
          borderRadius: mobile ? 26 : 12,
          color: muted,
          fontSize: size * 1.1,
          opacity: blocked ? 0.6 : 1,
        }}
      >
        {blocked ? 'Waiting for the reply...' : 'Type message'}
      </div>
      {on('secondarySendButton.enabled') && (
        <span
          className="rounded-full font-semibold shrink-0"
          style={{
            border: `1px solid ${primary}`,
            color: primary,
            fontSize: size * 0.85,
            padding: '8px 12px',
          }}
        >
          Quick action
        </span>
      )}
      <span
        className="grid place-items-center shrink-0"
        style={{
          width: mobile ? 56 : 48,
          height: mobile ? 56 : 48,
          borderRadius: mobile ? 28 : 12,
          background: mobile ? primary : iconsBg,
        }}
      >
        <Icon d={PATH.mic} color={mobile ? '#ffffff' : icons} />
      </span>
    </div>
  );

  const header = (mobile: boolean) =>
    showHeader && (
      <div
        className="flex items-center gap-3 shrink-0"
        style={{
          height: mobile ? 72 : 76,
          padding: mobile ? '0 16px' : '0 24px',
          background: surface,
          borderBottom: mobile ? 'none' : `1px solid ${border}`,
          borderRadius: mobile ? '0 0 24px 24px' : undefined,
          boxShadow: mobile ? '0 4px 12px rgba(0,0,0,0.06)' : undefined,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {mobile && <Icon d={PATH.back} color={muted} />}
        {!!c.chatHeaderBurgerMenu && <Icon d={PATH.burger} color={icons} />}
        <Avatar initials="TC" size={mobile ? 44 : 48} />
        <div className="min-w-0 flex-1">
          <div
            className="font-semibold truncate"
            style={{ fontSize: size * 1.2, color: text }}
          >
            Team chat
          </div>
          {showCount && (
            <div style={{ fontSize: size * 0.9, color: muted }}>
              24 users
              {!mobile && <span style={{ color: online }}> · 3 online</span>}
            </div>
          )}
        </div>
        {showSearch && <Icon d={PATH.search} color={icons} size={26} />}
        {on('translates.enabled') && (
          <Icon d={PATH.globe} color={icons} size={26} />
        )}
        {!off('disableRoomMenu') && (
          <Icon d={PATH.more} color={muted} size={26} />
        )}
      </div>
    );

  const rooms = [
    {
      i: 'TC',
      n: 'Team chat',
      who: 'Alex Lee',
      m: 'Great, see you there!',
      t: '10:45',
      o: 3,
      u: 0,
    },
    {
      i: 'AL',
      n: 'Alex Lee',
      who: 'Alex Lee',
      m: 'Is the demo still at 3?',
      t: '10/21',
      o: 0,
      u: 0,
    },
    {
      i: 'SP',
      n: 'Support',
      who: 'Maria Kim',
      m: 'Could you share a screenshot?',
      t: '10/19',
      o: 1,
      u: 2,
    },
    {
      i: 'DS',
      n: 'Design',
      who: 'Dan Smith',
      m: 'New mockups are up',
      t: '10/12',
      o: 2,
      u: 0,
    },
    {
      i: 'MK',
      n: 'Maria Kim',
      who: 'Maria Kim',
      m: 'Thanks!',
      t: '10/09',
      o: 0,
      u: 0,
    },
  ];

  const roomList = (
    <div
      className="flex flex-col shrink-0 min-h-0"
      style={{
        width: 400,
        background: surface,
        borderRight: `1px solid ${border}`,
        padding: '12px 16px 0',
      }}
    >
      <div
        className="grid grid-cols-2 rounded-xl p-1"
        style={{ background: dark ? '#15171a' : '#f1f3f6' }}
      >
        <div
          className="text-center rounded-lg font-semibold py-2"
          style={{
            background: dark ? '#24272d' : '#ffffff',
            color: text,
            fontSize: size,
          }}
        >
          Chats
        </div>
        <div
          className="text-center py-2"
          style={{ color: muted, fontSize: size }}
        >
          Files
        </div>
      </div>
      <div className="flex items-center gap-3 my-4">
        {showSearch && (
          <div
            className="flex-1 flex items-center gap-2 rounded-xl"
            style={{
              height: 48,
              padding: '0 14px',
              border: `1px solid ${border}`,
              color: muted,
              fontSize: size,
            }}
          >
            <Icon d={PATH.search} size={20} color={primary} />
            Search...
          </div>
        )}
        <Icon d={PATH.compass} color={icons} />
        {!off('disableNewChatButton') && (
          <Icon d={PATH.plusCircle} color={icons} />
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-1">
        {rooms.map((r, i) => (
          <div
            key={r.n}
            className="flex items-center gap-3 rounded-xl"
            style={{
              padding: '12px',
              background:
                i === 0
                  ? tint(primary, dark ? 0.2 : 0.1, iconsBg)
                  : 'transparent',
            }}
          >
            <Avatar initials={r.i} size={56} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="font-semibold truncate"
                  style={{ fontSize: size * 1.1, color: text }}
                >
                  {r.n}
                </span>
                {r.o > 0 && (
                  <span
                    className="shrink-0"
                    style={{ fontSize: size * 0.8, color: online }}
                  >
                    {r.o} online
                  </span>
                )}
                <span
                  className="ml-auto shrink-0"
                  style={{ fontSize: size * 0.8, color: muted }}
                >
                  {r.t}
                </span>
              </div>
              <div
                className="font-semibold truncate"
                style={{ fontSize: size * 0.85, color: muted }}
              >
                {r.who}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="truncate flex-1"
                  style={{ fontSize: size * 0.9, color: muted }}
                >
                  {r.m}
                </span>
                {r.u > 0 && (
                  <span
                    className="grid place-items-center rounded-full text-white font-semibold shrink-0"
                    style={{
                      width: 24,
                      height: 24,
                      background: primary,
                      fontSize: size * 0.75,
                    }}
                  >
                    {r.u}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const desktop = (
    <div
      className="flex"
      style={{
        ...DESKTOP_SCREEN,
        fontFamily: family,
        background: dark ? '#0f1115' : '#eef0f3',
        padding: 16,
      }}
    >
      <div
        className="flex flex-1 min-w-0 overflow-hidden rounded-2xl"
        style={{ border: `1px solid ${border}` }}
      >
        {showRooms && roomList}
        <div
          className="flex flex-col flex-1 min-w-0"
          style={{ background: chatBg }}
        >
          {header(false)}
          {messages(false)}
          {composer(false)}
        </div>
      </div>
    </div>
  );

  const phone = (
    <div
      className="flex flex-col"
      style={{ ...PHONE_SCREEN, fontFamily: family, background: chatBg }}
    >
      <div style={{ background: surface }}>
        <PhoneStatusBar color={text} />
      </div>
      {header(true)}
      {messages(true)}
      {composer(true)}
    </div>
  );

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="font-sans font-semibold text-sm">
          {t('appSettingsAppearance.previewHeading')}
        </div>
        <Segmented<PreviewTheme>
          ariaLabel={t('appSettingsAppearance.previewThemeLabel')}
          size="sm"
          value={theme}
          onChange={setTheme}
          options={[
            { value: 'light', label: t('appearance.themeLight') },
            { value: 'dark', label: t('appearance.themeDark') },
          ]}
        />
      </div>
      <DevicePreviewStage
        url={url}
        dark={dark}
        desktop={desktop}
        phone={phone}
      />
      <p className="font-sans text-xs text-gray-500 mt-3">
        {t('appSettingsAppearance.chatPreviewNote')}
      </p>
    </div>
  );
}
