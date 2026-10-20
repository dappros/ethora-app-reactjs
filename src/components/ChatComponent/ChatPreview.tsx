import cn from 'classnames';
import { ReactNode, useState } from 'react';
import { ChatConfigRecord, featureOfKey, hasChatFeature } from '../../lib/chatComponentConfig';
import { Segmented } from '../AIWidget/appearance/Fields';

// A still picture of the chat component, drawn from its own measurements
// (64px header, 18px bubbles with a tail, 40px avatars, pill input) and fed by
// the same settings the component reads. Nothing here connects to a chat: no
// session, no messages, just the look. Like the AI Widget's preview it is an
// approximation; the web chat is the real thing.

type Mode = 'chat' | 'rooms';

const D = { primary: '#0052cd', own: '#e7edf9', other: '#ffffff', input: '#ffffff' };

interface Props {
  config: ChatConfigRecord;
  features: string[] | undefined;
}

function Icon({ d, size = 20, color }: { d: string; size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const PATH = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4-4',
  more: 'M12 5v.01M12 12v.01M12 19v.01',
  burger: 'M4 6h16M4 12h16M4 18h16',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18',
  clip: 'm21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.3 3.3 0 0 1 4.7 4.7L10 17.5a1.7 1.7 0 0 1-2.4-2.4L15 7.8',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z',
  plus: 'M12 5v14M5 12h14',
  check: 'm4 12 5 5L20 6',
};

export function ChatPreview({ config: c, features }: Props) {
  const [mode, setMode] = useState<Mode>('chat');

  // Only what the license covers is shown, the same as in the saved config.
  const on = (key: string) => c[key] === true && hasChatFeature(features, featureOfKey(key));
  const off = (key: string) => c[key] === true;
  const str = (key: string, fallback: string) => (typeof c[key] === 'string' && c[key] ? (c[key] as string) : fallback);

  const dark = c.colorScheme === 'dark';
  const primary = str('colors.primary', D.primary);
  const icons = str('colors.icons', primary);
  const iconsBg = str('colors.iconsBg', str('colors.secondary', 'transparent'));
  const surface = dark ? '#171a22' : '#ffffff';
  const text = dark ? '#e8eaf0' : '#141414';
  const muted = dark ? '#9aa1b2' : '#6b7280';
  const border = dark ? '#2a2f3c' : '#e6e8ec';
  const chatBg = str('backgroundChat.color', dark ? '#12141a' : '#ffffff');
  const ownBg = str('colors.ownMessageBackground', dark ? '#2b3550' : D.own);
  const otherBg = str('colors.otherMessageBackground', dark ? '#232836' : D.other);
  const inputBg = str('colors.inputBackground', dark ? '#232836' : D.input);
  const size = Number.parseFloat(str('typography.fontSize', '15')) || 15;
  const family = str('typography.fontFamily', "'Open Sans', sans-serif");

  const aiTyping = on('customTypingIndicator.enabled');
  const typingText = str('customTypingIndicator.text', 'Thinking...');
  const blocked = aiTyping && on('blockMessageSendingWhenProcessing');
  const showTyping = aiTyping || !off('disableTypingIndicator');
  const profileClick = !off('disableProfilesInteractions');

  const Avatar = ({ letter, bg }: { letter: string; bg: string }) => (
    <div className={cn('shrink-0 grid place-items-center rounded-full font-semibold', profileClick && 'cursor-pointer')} style={{ width: 40, height: 40, background: bg, color: '#141414', fontSize: size * 0.9 }}>
      {letter}
    </div>
  );

  // A bubble with the component's 18px radius and the square tail corner.
  const Bubble = ({ own, tail, children, time, ticks }: { own?: boolean; tail?: boolean; children: ReactNode; time: string; ticks?: boolean }) => {
    const r = 18;
    const small = tail ? 0 : 8;
    return (
      <div
        className="relative max-w-[70%] min-w-[15%] flex flex-col"
        style={{
          background: own ? ownBg : otherBg,
          color: text,
          border: own ? '1px solid transparent' : `1px solid ${border}`,
          borderRadius: own ? `${r}px ${r}px ${small}px ${r}px` : `${r}px ${r}px ${r}px ${small}px`,
          padding: '8px 12px',
          fontSize: size,
          lineHeight: 1.4,
        }}
      >
        <div>{children}</div>
        <div className="self-end flex items-center gap-1 mt-0.5" style={{ fontSize: size * 0.75, color: muted }}>
          {time}
          {ticks && <Icon d={PATH.check} size={12} color={primary} />}
        </div>
      </div>
    );
  };

  const header = !off('disableHeader') && (
    <div className="flex items-center gap-3 shrink-0" style={{ height: 64, padding: '8px 16px', background: surface, borderBottom: `1px solid ${border}` }}>
      {!!c.chatHeaderBurgerMenu && <Icon d={PATH.burger} color={icons} />}
      <Avatar letter="S" bg="#f9d9a8" />
      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate" style={{ fontSize: size, color: text }}>Support team</div>
        {!off('disableUserCount') && <div style={{ fontSize: size * 0.8, color: muted }}>3 members</div>}
      </div>
      {!c['chatHeaderSettings.hideSearch'] && <Icon d={PATH.search} color={icons} />}
      {on('translates.enabled') && <Icon d={PATH.globe} color={icons} />}
      {!off('disableRoomMenu') && <Icon d={PATH.more} color={icons} />}
    </div>
  );

  const conversation = (
    <div className="flex flex-col min-h-0 flex-1" style={{ background: chatBg }}>
      {header}
      <div className="flex-1 min-h-0 flex flex-col justify-end gap-3 px-4 py-3">
        <div className="self-center rounded-full px-3 py-0.5" style={{ fontSize: size * 0.75, color: muted, background: dark ? '#232836' : '#f1f3f6' }}>Today</div>
        <div className="flex items-end gap-2">
          <Avatar letter="A" bg="#cfe3ff" />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span style={{ fontSize: size * 0.8, color: muted }}>Alex</span>
            <Bubble tail time="10:41">Hi, how can I help you?</Bubble>
          </div>
        </div>
        <div className="flex justify-end">
          <Bubble own tail ticks time="10:42">Do you ship internationally?</Bubble>
        </div>
        {!off('disableMedia') && (
          <div className="flex items-end gap-2">
            <Avatar letter="A" bg="#cfe3ff" />
            <div className="rounded-2xl overflow-hidden" style={{ width: 150, height: 96, background: 'linear-gradient(135deg,#9ec5fe,#c7b7ff)', border: `1px solid ${border}` }} aria-label="Photo" />
          </div>
        )}
        <div className="flex items-end gap-2">
          <Avatar letter="A" bg="#cfe3ff" />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span style={{ fontSize: size * 0.8, color: muted }}>Alex</span>
            <Bubble tail time="10:43">Yes! We ship to over 40 countries.</Bubble>
          </div>
        </div>
        {showTyping && (
          <div className={cn('flex', aiTyping && str('customTypingIndicator.position', 'bottom') === 'top' ? 'order-first' : '')} style={{ fontSize: size * 0.8, color: muted }}>
            {aiTyping ? `${typingText}` : 'Alex is typing...'}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0" style={{ padding: '10px 12px', background: surface, borderTop: `1px solid ${border}` }}>
        {!off('disableMedia') && (
          <span className="grid place-items-center rounded-full" style={{ width: 36, height: 36, background: iconsBg }}>
            <Icon d={PATH.clip} color={icons} />
          </span>
        )}
        <div className="flex-1 min-w-0 rounded-full px-4 py-2.5" style={{ background: inputBg, border: `1px solid ${border}`, color: blocked ? muted : text, fontSize: size, opacity: blocked ? 0.6 : 1 }}>
          {blocked ? 'Waiting for the reply...' : 'Type message'}
        </div>
        {on('secondarySendButton.enabled') && (
          <span className="rounded-full px-3 py-2 font-semibold" style={{ border: `1px solid ${primary}`, color: primary, fontSize: size * 0.8 }}>Quick action</span>
        )}
        <span className="grid place-items-center rounded-full" style={{ width: 36, height: 36, background: iconsBg === 'transparent' ? primary : iconsBg, opacity: blocked ? 0.5 : 1 }}>
          <Icon d={PATH.send} color={iconsBg === 'transparent' ? '#ffffff' : icons} size={18} />
        </span>
      </div>
    </div>
  );

  const rooms = (
    <div className="flex flex-col min-h-0 flex-1" style={{ background: surface }}>
      <div className="flex items-center justify-between shrink-0" style={{ height: 64, padding: '8px 16px' }}>
        <span className="font-semibold" style={{ fontSize: size * 1.2, color: text }}>Chats</span>
        {!off('disableNewChatButton') && (
          <span className="grid place-items-center rounded-full" style={{ width: 36, height: 36, background: iconsBg === 'transparent' ? primary : iconsBg }}>
            <Icon d={PATH.plus} color={iconsBg === 'transparent' ? '#ffffff' : icons} size={18} />
          </span>
        )}
      </div>
      {!c['chatHeaderSettings.hideSearch'] && (
        <div className="mx-4 mb-2 rounded-xl px-3 py-2 flex items-center gap-2" style={{ background: dark ? '#232836' : '#f1f3f6', color: muted, fontSize: size * 0.9 }}>
          <Icon d={PATH.search} size={16} color={muted} />
          Search
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-hidden">
        {[
          { n: 'Support team', m: 'Yes! We ship to over 40 countries.', t: '10:43', u: 2, c: '#f9d9a8' },
          { n: 'Sales', m: 'Quote sent', t: '09:12', u: 0, c: '#cfe3ff' },
          { n: 'Onboarding', m: 'Welcome aboard!', t: 'Mon', u: 0, c: '#d6f5d6' },
        ].map((r, i) => (
          <div key={r.n} className="flex items-center gap-3 px-4" style={{ height: 64, background: i === 0 ? (dark ? '#232836' : '#eef3fb') : 'transparent', color: text }}>
            <div className="grid place-items-center rounded-full font-semibold" style={{ width: 40, height: 40, background: r.c, color: '#141414' }}>{r.n[0]}</div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate" style={{ fontSize: size }}>{r.n}</div>
              <div className="truncate" style={{ fontSize: size * 0.85, color: muted }}>{r.m}</div>
            </div>
            <div className="flex flex-col items-end gap-1" style={{ fontSize: size * 0.75, color: muted }}>
              {r.t}
              {r.u > 0 && <span className="rounded-full px-1.5 text-white" style={{ background: primary }}>{r.u}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const roomsHidden = off('disableRooms');
  const shown = mode === 'rooms' && !roomsHidden ? rooms : conversation;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="font-sans font-semibold text-sm">Live preview</div>
        <Segmented<Mode>
          ariaLabel="Preview screen"
          size="sm"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'chat', label: 'Chat' },
            { value: 'rooms', label: 'Rooms' },
          ]}
        />
      </div>
      <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col" style={{ height: 560, background: surface, fontFamily: family }}>
        {mode === 'rooms' && roomsHidden ? (
          <div className="flex-1 grid place-items-center text-center px-6" style={{ color: muted, fontSize: size * 0.9 }}>The room list is switched off, so the chat opens straight into one conversation.</div>
        ) : (
          shown
        )}
      </div>
      <p className="font-sans text-xs text-gray-500 mt-2">An approximation of the chat component. Save, then open the web chat to see the real thing.</p>
    </div>
  );
}
