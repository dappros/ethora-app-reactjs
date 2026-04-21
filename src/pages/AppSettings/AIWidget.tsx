import {
  AiAssistant,
  XmppProvider,
  createAnonymousXmppCredentials,
} from '@ethora/ai-chat-widget';
import { Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { SourcesSiteCrawlModal } from '../../components/modal/SourcesSiteCrawlModal';
import { httpUpdateApp } from '../../http';
import { ModelAIbot, ModelAppDefaulRooom, SiteLinks } from '../../models';

import { HeaderAIWidget } from '../../components/AIWidget/HeaderAIWidget';
// Phase 1 follow-up: TabAIWidget (multi-tab editor for prompt/web/docs/code) replaced by
// the standalone Code panel. Persona / Context / Web Index / Docs Index now live under
// the global /app/admin/agents area, since Agents are tenant-scope, not per-App.
import { TabAIWidgetCode } from '../../components/AIWidget/TabAIWidget/TabAIWidgetCode';
import { useAppStore } from '../../store/useAppStore';
import { ModelApp } from '../../models';
import { ActiveAgentSelector } from '../../components/AIWidget/ActiveAgentSelector';
import './AIWidget.scss';

const ASSISTANT_USER_STORAGE_KEY = 'ethora-assistant-user';
const ASSISTANT_MESSAGES_STORAGE_KEY = 'ethora-assistant-messages';
const ASSISTANT_TIMESTAMP_STORAGE_KEY = 'ethora-assistant-timestamp';
const ASSISTANT_PERSIST_SLICE_KEY = 'persist:assistanRoomSlice';
const ASSISTANT_CHAT_SETTINGS_PERSIST_KEY = 'persist:chatSettingStore';
const ASSISTANT_ROOMS_PERSIST_KEY = 'persist:roomMessages';
const ASSISTANT_ROOM_HEAP_PERSIST_KEY = 'persist:roomHeapSlice';
const ASSISTANT_ROOT_PERSIST_KEY = 'persist:root';

const statusAiBot = {
  on: true,
  off: false,
};

const getXmppDomainFromJid = (jid?: string): string => {
  if (!jid || !jid.includes('@')) {
    return '';
  }

  return jid.split('@')[1] || '';
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasValidAssistantMessageMap = (value: unknown): boolean => {
  if (!isPlainObject(value)) {
    return false;
  }

  return Object.values(value).every(Array.isArray);
};

const hasValidAssistantPersistSlice = (value: unknown): boolean => {
  if (!isPlainObject(value)) {
    return false;
  }

  const persistedMessages = value.messages;
  if (typeof persistedMessages === 'string') {
    try {
      return hasValidAssistantMessageMap(JSON.parse(persistedMessages));
    } catch {
      return false;
    }
  }

  return hasValidAssistantMessageMap(persistedMessages);
};

const sanitizeAssistantWidgetStorage = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  // The assistant widget keeps its own lightweight assistant history. Clearing
  // these older shared chat slices avoids rehydrating malformed room state from
  // previous widget versions while preserving the assistant-specific transcript.
  window.localStorage.removeItem(ASSISTANT_CHAT_SETTINGS_PERSIST_KEY);
  window.localStorage.removeItem(ASSISTANT_ROOMS_PERSIST_KEY);
  window.localStorage.removeItem(ASSISTANT_ROOM_HEAP_PERSIST_KEY);
  window.localStorage.removeItem(ASSISTANT_ROOT_PERSIST_KEY);

  try {
    const storedMessages = window.localStorage.getItem(
      ASSISTANT_MESSAGES_STORAGE_KEY
    );
    if (storedMessages) {
      const parsed = JSON.parse(storedMessages);
      if (!hasValidAssistantMessageMap(parsed)) {
        window.localStorage.removeItem(ASSISTANT_MESSAGES_STORAGE_KEY);
      }
    }
  } catch {
    window.localStorage.removeItem(ASSISTANT_MESSAGES_STORAGE_KEY);
  }

  try {
    const persistedSlice = window.localStorage.getItem(ASSISTANT_PERSIST_SLICE_KEY);
    if (persistedSlice) {
      const parsed = JSON.parse(persistedSlice);
      if (!hasValidAssistantPersistSlice(parsed)) {
        window.localStorage.removeItem(ASSISTANT_PERSIST_SLICE_KEY);
        window.localStorage.removeItem(ASSISTANT_MESSAGES_STORAGE_KEY);
        window.localStorage.removeItem(ASSISTANT_USER_STORAGE_KEY);
        window.localStorage.removeItem(ASSISTANT_TIMESTAMP_STORAGE_KEY);
      }
    }
  } catch {
    window.localStorage.removeItem(ASSISTANT_PERSIST_SLICE_KEY);
    window.localStorage.removeItem(ASSISTANT_MESSAGES_STORAGE_KEY);
    window.localStorage.removeItem(ASSISTANT_USER_STORAGE_KEY);
    window.localStorage.removeItem(ASSISTANT_TIMESTAMP_STORAGE_KEY);
  }
};

interface Props {
  appId: string;
  app?: ModelApp;
  setAiBot: (aiBot: ModelAIbot) => void;
  aiBot: ModelAIbot;
  defaultChatRooms: Array<ModelAppDefaulRooom>;
  primaryColor: string;
  isDisabled: boolean;
  loadingTextCrawl?: boolean;
  handleRagChange: () => void;
  handleSiteCrawl: (url: string, followLink: boolean) => void;
  handleCrawlReindex: (id: string) => void;
  deleteSiteCrawl: (url: string[]) => void;
}

// Phase 1 follow-up: AIWidget now only renders the embed-Code panel + ActiveAgentSelector
// + status bar. The legacy Prompt / Add websites / Add documents tabs moved to the global
// /app/admin/agents area, so loadingTextCrawl / handleCrawlReindex / setChoseUrl /
// ragRef / url state are no longer used here. Props interface kept stable so the parent
// AppSettings doesn't need to change.
export function AIWidget({
  appId,
  app,
  aiBot,
  setAiBot,
  handleRagChange,
  deleteSiteCrawl,
}: Props) {
  const aiWidgetValues = useAppStore((s) => s.aiWidgetValues);
  const envXmppHost = import.meta.env.VITE_XMPP_HOST || '';
  const envXmppConference = import.meta.env.VITE_XMPP_SERVICE || '';
  const envXmppWebsocketUrl = import.meta.env.VITE_APP_XMPP_SERVICE || '';

  const [statusBot, setStatusBot] = useState<boolean>(false);
  const [showNewDocModal, setShowNewDocModal] = useState<boolean>(false);
  const [value, setValue] = useState('1');
  const [assistantStorageReady, setAssistantStorageReady] = useState(false);

  const [choseUrl] = useState<SiteLinks[]>([]);
  const user = createAnonymousXmppCredentials();
  const xmppHost = useMemo(
    () => getXmppDomainFromJid(app?.systemChatAccount?.jid) || envXmppHost,
    [app?.systemChatAccount?.jid, envXmppHost]
  );
  const xmppConference = useMemo(
    () => (xmppHost ? envXmppConference || `conference.${xmppHost}` : ''),
    [envXmppConference, xmppHost]
  );
  const xmppWebsocketUrl = useMemo(
    () => (xmppHost ? envXmppWebsocketUrl || `wss://${xmppHost}/ws` : ''),
    [envXmppWebsocketUrl, xmppHost]
  );
  const assistantChatConfig = useMemo(
    () => ({
      colors: { primary: '#1976D2', secondary: '#E1E4FE' },
      assistantButton: {
        position: { right: 24, bottom: 24 },
        ariaLabel: 'Open assistant chat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      assistantPopup: {
        width: 320,
        height: 520,
        closeButtonAriaLabel: 'Close assistant chat',
      },
      assistantOpenStateKey: 'EthoraAssistantOpen',
      disableMedia: true,
      disableInteractions: true,
      disableRooms: true,
      xmppSettings: {
        devServer: xmppWebsocketUrl,
        host: xmppHost,
        conference: xmppConference,
      },
    }),
    [xmppConference, xmppHost, xmppWebsocketUrl]
  );

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const handleStatusChange = async () => {
    try {
      const status = statusBot ? 'off' : 'on';
      const response = await httpUpdateApp(appId, { botStatus: status });
      const nextAiBot = response?.data?.result?.aiBot;

      if (nextAiBot) {
        setAiBot(nextAiBot);
      }

      const isNewStatus = nextAiBot?.status === 'on';
      setStatusBot(isNewStatus);
    } catch (error) {
      console.error('Error updating AI bot status:', error);
    }
  };

  const size = useMemo(() => {
    if (!aiBot.siteUrlsV2 || !aiBot.siteUrlsV2.length) {
      return null;
    }
    return (
      aiBot.siteUrlsV2.reduce((sum, l) => sum + l.mdByteSize, 0) /
      (1024 * 1024)
    ).toFixed(2);
  }, [aiBot.siteUrlsV2]);

  useEffect(() => {
    sanitizeAssistantWidgetStorage();
    setAssistantStorageReady(true);
  }, []);

  useEffect(() => {
    if (aiBot.status) {
      setStatusBot(statusAiBot[aiBot.status]);
    }
  }, [aiBot.status]);

  // (Was: prefilling the now-removed Add-website input from aiBot.siteUrlsV2.)

  return (
    <div className="w-full h-full overflow-x-auto overflow-y-hidden">
      {/* Phase 1 (Agents): pick which Agent backs the AI Widget. The full set of agents
          is now managed in the AI Bots tab; this selector just decides which one's
          persona/avatar/display name the embedded widget surfaces. */}
      <ActiveAgentSelector appId={appId as string} app={app} />

      <HeaderAIWidget
        isRag={aiBot.isRAG}
        statusBot={statusBot}
        handleStatusChange={handleStatusChange}
        handleRagChange={handleRagChange}
        size={size}
      />

      {/* Phase 1 follow-up: only the Code panel (embed snippet) remains here. The other
          legacy tabs (Prompt / Add websites / Add documents) now live under each Agent
          in the global /app/admin/agents area. */}
      <div className="w-full h-full overflow-x-auto overflow-y-hidden">
        <TabAIWidgetCode
          value={value}
          appId={appId}
          app={app}
          userId={aiBot.userId}
          handleChange={handleChange}
        />
      </div>

      {showNewDocModal && (
        <SourcesSiteCrawlModal
          urls={choseUrl}
          onClose={() => setShowNewDocModal(false)}
          deleteSiteCrawl={deleteSiteCrawl}
        />
      )}

      {statusBot && assistantStorageReady && xmppHost && xmppWebsocketUrl && (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <XmppProvider>
          <Box className="chatAssistantButton">
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <AiAssistant
              roomJID={`${appId}_${aiBot.userId}-bot@${xmppHost}`}
              config={{
                ...assistantChatConfig,
                assistantMode: { enabled: true, user },
                botDisplayName: aiWidgetValues.displayName || undefined,
                botAvatar: aiWidgetValues.avatar || undefined,
              }}
            />
          </Box>
        </XmppProvider>
      )}
    </div>
  );
}
