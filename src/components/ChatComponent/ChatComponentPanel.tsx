import { Button } from '@mui/material';
import cn from 'classnames';
import { useState } from 'react';
import { ChatConfigRecord, ChatFeatureId, featureOfKey, hasChatFeature } from '../../lib/chatComponentConfig';
import { ColorField } from '../AIWidget/appearance/ColorField';
import { Card, Segmented, SelectField, SwitchRow, TextField } from '../AIWidget/appearance/Fields';
import { getSwatches } from '../AIWidget/appearance/options';
import { useWidth } from '../AIWidget/appearance/useWidth';
import { ChatPreview } from './ChatPreview';

// Editor for the chat component's look and options, same layout as the AI
// Widget's "Customize appearance": tabs on the left, a live preview on the
// right, Save applies it to the web chat. Options the license does not cover
// stay visible but locked.

interface Props {
  config: ChatConfigRecord;
  onChange: (updates: ChatConfigRecord) => void;
  onSave: () => void;
  onReset: () => void;
  isDirty: boolean;
  saving: boolean;
  features: string[] | undefined;
  brandColor?: string | null;
}

type TabId = 'style' | 'layout' | 'features';

const TWO_COLUMN_MIN_WIDTH = 880;
const FEATURE_SCHEDULE_URL = 'https://ethora.com/legal/feature-schedule';

// What the component renders while a key is unset (IConfig docs).
const DEFAULTS = {
  primary: '#0052cd',
  secondary: '#e7edf9',
  own: '#e7edf9',
  other: '#ffffff',
  input: '#ffffff',
};

const FONT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'ui-monospace, monospace', label: 'Monospace' },
];

const GROUP_LABEL: Record<ChatFeatureId, string> = { core: 'Core', ai: 'AI agents', b2b: 'B2B', compliance: 'Compliance' };

// Switches that turn a feature on (stored true).
const FEATURE_ROWS: Array<{ key: string; label: string; hint: string }> = [
  { key: 'botMessageAutoScroll', label: 'AI reply auto-scroll', hint: 'Follow bot answers as they stream in' },
  { key: 'customTypingIndicator.enabled', label: 'AI "thinking" indicator', hint: 'Custom typing indicator for agent replies' },
  { key: 'blockMessageSendingWhenProcessing', label: 'Wait for the AI reply', hint: 'Block sending while the agent is answering' },
  { key: 'translates.enabled', label: 'Translations', hint: 'Translate messages between languages' },
  { key: 'secondarySendButton.enabled', label: 'Secondary send button', hint: 'A second action button next to send (quick actions)' },
  { key: 'clearStoreBeforeInit', label: 'Clear local store on start', hint: 'Wipe cached chat data every time the chat starts' },
];

// Switches that hide a part of the UI (stored true = hidden), shown inverted.
const LAYOUT_ROWS: Array<{ key: string; label: string; hint: string }> = [
  { key: 'disableHeader', label: 'Header', hint: 'The bar above the conversation' },
  { key: 'disableRooms', label: 'Room list', hint: '1:1 and group rooms' },
  { key: 'disableNewChatButton', label: 'New chat button', hint: 'Let people start a chat' },
  { key: 'disableRoomMenu', label: 'Room menu', hint: 'The per-room actions menu' },
  { key: 'disableUserCount', label: 'Member count', hint: 'The number of people in a room' },
  { key: 'disableMedia', label: 'Media sharing', hint: 'Images, video and files' },
  { key: 'disableTypingIndicator', label: 'Typing indicator', hint: 'Show who is typing' },
  { key: 'disableProfilesInteractions', label: 'Profile popups', hint: 'Open a profile by clicking a name or avatar' },
];

function LockedHint() {
  return (
    <a href={FEATURE_SCHEDULE_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 underline font-sans">
      Upgrade to unlock
    </a>
  );
}

export function ChatComponentPanel({ config: c, onChange, onSave, onReset, isDirty, saving, features, brandColor }: Props) {
  const [tab, setTab] = useState<TabId>('style');
  const [rootRef, rootWidth] = useWidth<HTMLDivElement>();
  const twoColumns = rootWidth >= TWO_COLUMN_MIN_WIDTH;
  const swatches = getSwatches(brandColor);

  const str = (key: string) => (typeof c[key] === 'string' ? (c[key] as string) : '');
  const flag = (key: string) => c[key] === true;
  const set = (key: string, value: string | boolean) => onChange({ [key]: value });

  const color = (key: string, label: string, fallback: string, hint?: string) => (
    <ColorField label={label} hint={hint} value={str(key)} fallback={fallback} swatches={swatches} onChange={(v) => set(key, v)} />
  );

  const styleTab = (
    <>
      <Card title="Theme">
        <div className="grid grid-cols-1 gap-3">
          <SelectField
            label="Color scheme"
            hint="Light, dark, or follow the visitor's system"
            value={str('colorScheme')}
            onChange={(v) => set('colorScheme', v)}
            options={[
              { value: '', label: 'Light (default)' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'Follow system' },
            ]}
          />
          {color('colors.primary', 'Primary color', DEFAULTS.primary, 'Buttons, header and accents')}
          {color('colors.secondary', 'Secondary color', DEFAULTS.secondary)}
          {color('colors.icons', 'Icons color', DEFAULTS.primary)}
          {color('colors.iconsBg', 'Icon background', DEFAULTS.secondary)}
        </div>
      </Card>
      <Card title="Messages">
        <div className="grid grid-cols-1 gap-3">
          {color('colors.ownMessageBackground', 'Your message bubble', DEFAULTS.own)}
          {color('colors.otherMessageBackground', "Other people's bubbles", DEFAULTS.other)}
          {color('colors.inputBackground', 'Message input', DEFAULTS.input)}
          {color('backgroundChat.color', 'Conversation background', '#f5f7fb')}
        </div>
      </Card>
      <Card title="Typography">
        <div className="grid grid-cols-1 gap-3">
          <SelectField label="Font" value={FONT_OPTIONS.some((o) => o.value === str('typography.fontFamily')) ? str('typography.fontFamily') : ''} onChange={(v) => set('typography.fontFamily', v)} options={FONT_OPTIONS} />
          <TextField label="Text size" hint='In pixels, or with a unit such as "1.1rem". Default 16.' value={str('typography.fontSize')} placeholder="16" onChange={(v) => set('typography.fontSize', v)} maxLength={8} />
        </div>
      </Card>
    </>
  );

  const layoutTab = (
    <Card title="Show or hide" description="Switch off what you do not want in the chat.">
      <div className="flex flex-col gap-2">
        {LAYOUT_ROWS.map((r) => (
          <SwitchRow key={r.key} label={r.label} description={r.hint} checked={!flag(r.key)} onChange={(on) => set(r.key, !on)} />
        ))}
      </div>
    </Card>
  );

  const groups = (['ai', 'b2b', 'compliance'] as ChatFeatureId[]).map((g) => ({
    id: g,
    rows: FEATURE_ROWS.filter((r) => featureOfKey(r.key) === g),
  }));

  const featuresTab = (
    <>
      {groups.map((g) => {
        const unlocked = hasChatFeature(features, g.id);
        return (
          <Card key={g.id} title={GROUP_LABEL[g.id]}>
            {!unlocked && (
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500 font-sans">Not included in your license</span>
                <LockedHint />
              </div>
            )}
            <div className="flex flex-col gap-2">
              {g.rows.map((r) => (
                <SwitchRow
                  key={r.key}
                  label={`${unlocked ? '' : '🔒 '}${r.label}`}
                  description={r.hint}
                  checked={unlocked && flag(r.key)}
                  disabled={!unlocked}
                  onChange={(on) => set(r.key, on)}
                />
              ))}
              {g.id === 'ai' && unlocked && flag('customTypingIndicator.enabled') && (
                <TextField label="Indicator text" value={str('customTypingIndicator.text')} placeholder="Thinking..." onChange={(v) => set('customTypingIndicator.text', v)} maxLength={80} />
              )}
            </div>
          </Card>
        );
      })}
    </>
  );

  return (
    <div ref={rootRef} className="w-full p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <p className="font-sans text-xs text-gray-500 max-w-xl flex-1 min-w-[16rem]">
          Customize how the chat looks and behaves in this app's web chat. The preview updates as you edit; once saved, the change reaches the web chat on its next load.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {isDirty && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 font-sans">
              <span className="size-2 rounded-full bg-amber-500" aria-hidden="true" />
              Unsaved changes
            </span>
          )}
          <Button size="small" variant="text" onClick={onReset}>
            Reset to defaults
          </Button>
          <Button size="small" variant="contained" onClick={onSave} disabled={!isDirty || saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className={cn('grid gap-6 items-start', twoColumns ? 'grid-cols-[minmax(0,1fr)_minmax(340px,440px)]' : 'grid-cols-1')}>
        <div className="flex flex-col gap-4 min-w-0">
          <Segmented<TabId>
            ariaLabel="Chat component"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'style', label: 'Style' },
              { value: 'layout', label: 'Layout' },
              { value: 'features', label: 'Features' },
            ]}
          />
          {tab === 'style' && styleTab}
          {tab === 'layout' && layoutTab}
          {tab === 'features' && featuresTab}
        </div>
        <div className={cn(twoColumns && 'sticky top-4')}>
          <ChatPreview config={c} features={features} />
        </div>
      </div>
    </div>
  );
}
