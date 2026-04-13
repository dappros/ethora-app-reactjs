import {
  AiAssistant,
  XmppProvider,
  createAnonymousXmppCredentials,
} from '@ethora/ai-chat-widget';
import { Box } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SourcesSiteCrawlModal } from '../../components/modal/SourcesSiteCrawlModal';
import { httpUpdateApp } from '../../http';
import { ModelAIbot, ModelAppDefaulRooom, SiteLinks } from '../../models';

import { HeaderAIWidget } from '../../components/AIWidget/HeaderAIWidget';
import { TabAIWidget } from '../../components/AIWidget/TabAIWidget';
import { useAppStore } from '../../store/useAppStore';
import './AIWidget.scss';

const ASSISTANT_USER_STORAGE_KEY = 'ethora-assistant-user';
const ASSISTANT_MESSAGES_STORAGE_KEY = 'ethora-assistant-messages';
const ASSISTANT_TIMESTAMP_STORAGE_KEY = 'ethora-assistant-timestamp';
const ASSISTANT_PERSIST_SLICE_KEY = 'persist:assistanRoomSlice';

const xmppHost = import.meta.env.VITE_XMPP_HOST || 'xmpp.ethoradev.com';
const xmppConference =
  import.meta.env.VITE_XMPP_SERVICE || `conference.${xmppHost}`;
const xmppWebsocketUrl =
  import.meta.env.VITE_APP_XMPP_SERVICE || `wss://${xmppHost}:5443/ws`;

const assistantChatConfig = {
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
};

const statusAiBot = {
  on: true,
  off: false,
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

export function AIWidget({
  appId,
  aiBot,
  setAiBot,
  handleRagChange,
  handleSiteCrawl,
  deleteSiteCrawl,
  loadingTextCrawl,
  handleCrawlReindex,
}: Props) {
  const aiWidgetValues = useAppStore((s) => s.aiWidgetValues);

  const [statusBot, setStatusBot] = useState<boolean>(false);
  const [showNewDocModal, setShowNewDocModal] = useState<boolean>(false);
  const [value, setValue] = useState('1');
  const [assistantStorageReady, setAssistantStorageReady] = useState(false);

  const [url, setUrl] = useState<string>('');
  const [choseUrl, setChoseUrl] = useState<SiteLinks[]>([]);
  const user = createAnonymousXmppCredentials();

  const ragRef = useRef<HTMLDivElement>(null);

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const handleStatusChange = async () => {
    try {
      const status = statusBot ? 'off' : 'on';
      const response = await httpUpdateApp(appId, { botStatus: status });

      const isNewStatus = response.data.result.aiBot.status === 'on';
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

  useEffect(() => {
    if (aiBot.siteUrlsV2 && !!aiBot.siteUrlsV2.length) {
      setUrl(aiBot.siteUrlsV2[0].url);
    }
  }, [aiBot.siteUrlsV2]);

  return (
    <div className="w-full h-full overflow-x-auto overflow-y-hidden">
      <HeaderAIWidget
        isRag={aiBot.isRAG}
        statusBot={statusBot}
        handleStatusChange={handleStatusChange}
        handleRagChange={handleRagChange}
        size={size}
      />

      <TabAIWidget
        value={value}
        appId={appId}
        userId={aiBot.userId}
        handleChange={handleChange}
        aiBot={aiBot}
        setAiBot={setAiBot}
        url={url}
        ragRef={ragRef}
        setUrl={setUrl}
        handleSiteCrawl={handleSiteCrawl}
        setChoseUrl={setChoseUrl}
        setShowNewDocModal={setShowNewDocModal}
        loadingTextCrawl={loadingTextCrawl}
        handleCrawlReindex={handleCrawlReindex}
      />

      {showNewDocModal && (
        <SourcesSiteCrawlModal
          urls={choseUrl}
          onClose={() => setShowNewDocModal(false)}
          deleteSiteCrawl={deleteSiteCrawl}
        />
      )}

      {statusBot && assistantStorageReady && (
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
