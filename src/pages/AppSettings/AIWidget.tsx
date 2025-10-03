import {
  Chat,
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
    devServer: 'wss://xmpp.ethoradev.com:5443/ws',
    host: 'xmpp.ethoradev.com',
    conference: 'conference.xmpp.ethoradev.com',
  },
};

const statusAiBot = {
  on: true,
  off: false,
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
  handleSiteCrawl: (url: string) => void;
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
    if (aiBot.status) {
      setStatusBot(statusAiBot[aiBot.status]);
    }
  }, [aiBot.status]);

  useEffect(() => {
    if (aiBot.siteUrlsV2 && !!aiBot.siteUrlsV2.length) {
      setUrl(aiBot.siteUrlsV2[0].url);
    }
  }, [aiBot.siteUrlsV2]);

  console.log('aiWidgetValues', aiWidgetValues);

  return (
    <div className="">
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

      {statusBot && (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <XmppProvider>
          <Box className="chatAssistantButton">
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <Chat
              roomJID={`${appId}_${aiBot.userId}-bot@xmpp.ethoradev.com`}
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
