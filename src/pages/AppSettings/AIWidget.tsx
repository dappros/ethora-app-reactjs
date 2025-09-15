import {
  Chat,
  XmppProvider,
  createAnonymousXmppCredentials,
} from '@ethora/ai-chat-widget';
import { Box } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SourcesSiteCrawlModal } from '../../components/modal/SourcesSiteCrawlModal';
import { httpUpdateApp } from '../../http';
import { ModelAIbot, ModelAppDefaulRooom } from '../../models';

import { HeaderAIWidget } from '../../components/AIWidget/HeaderAIWidget';
import { TabAIWidget } from '../../components/AIWidget/TabAIWidget';
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
  handleSiteCrawl: (url: string) => void;
  deleteSiteCrawl: (url: string[]) => void;
}

export function AIWidget({
  appId,
  aiBot,
  setAiBot,
  handleSiteCrawl,
  deleteSiteCrawl,
}: Props) {
  const [statusBot, setStatusBot] = useState<boolean>(false);
  const [showNewDocModal, setShowNewDocModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string>('');
  const [value, setValue] = useState('1');

  const [url, setUrl] = useState<string>('');
  const [choseUrl, setChoseUrl] = useState<string[]>([]);
  // const [scriptCode , setScriptCode] = useState<string>('');
  const user = createAnonymousXmppCredentials();

  const ragRef = useRef<HTMLDivElement>(null);

  const scriptCode = useMemo(() => {
    if (!appId && !aiBot.userId) {
      return '<script></script>';
    }

    return `<script
  src="https://dappros-wp-scripts.s3.us-east-2.amazonaws.com/ethora_assistant.js" 
  id="chat-content-assistant"
  data-bot-id="${appId}_${aiBot.userId}-bot@xmpp.ethoradev.com"
></script>`;
  }, [appId, aiBot.userId]);

  const currentCopyTarget = useMemo(() => {
    if (value === '1') {
      return scriptCode;
    }
    if (appId && aiBot.userId) {
      return `${appId}_${aiBot.userId}-bot@xmpp.ethoradev.com`;
    }
    return '';
  }, [value, scriptCode, appId, aiBot.userId]);

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setCopiedText(text);
    });
  };

  useEffect(() => {
    if (aiBot.status) {
      setStatusBot(statusAiBot[aiBot.status]);
    }
  }, [aiBot.status]);

  useEffect(() => {
    if (aiBot.siteLinks && !!aiBot.siteLinks.length) {
      setUrl(aiBot.siteLinks[0]);
    }
  }, [aiBot.siteLinks]);

  useEffect(() => {
    setCopied(copiedText === currentCopyTarget && currentCopyTarget.length > 0);
  }, [copiedText, currentCopyTarget]);

  return (
    <div className="">
      <HeaderAIWidget
        statusBot={statusBot}
        handleStatusChange={handleStatusChange}
      />

      <TabAIWidget
        value={value}
        copied={copied}
        scriptCode={scriptCode}
        appId={appId}
        userId={aiBot.userId}
        handleChange={handleChange}
        handleCopy={handleCopy}
        aiBot={aiBot}
        setAiBot={setAiBot}
        url={url}
        ragRef={ragRef}
        setUrl={setUrl}
        handleSiteCrawl={handleSiteCrawl}
        setChoseUrl={setChoseUrl}
        setShowNewDocModal={setShowNewDocModal}
      />

      <div
        ref={ragRef}
        className="font-semibold font-sans text-[16px] pb-4 pt-8 text-blue-600"
      >
        RAG (Retrieval Augmented Generation)
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1 text-blue-600">
        This feature allows you to augment your LLM-powered AI agent chat bot
        with your own context data. Just index your website or upload documents
        that provide additional information e.g. your products and services.
      </p>
      <p className="font-sans text-sm pb-4 flex items-center gap-1 text-blue-600">
        Your data will be converted into vector space embeddings used by your AI
        agent as its “external memory” when answering users queries.
      </p>
      <p className="font-sans text-sm pb-4 text-blue-600 items-center gap-1 mb-8 inline-block">
        This allows you to{' '}
        <strong>create your own project-specific AI agents</strong> without
        being limited by the prompt context window size.
      </p>

      {showNewDocModal && (
        <SourcesSiteCrawlModal
          urls={choseUrl}
          onClose={() => setShowNewDocModal(false)}
          deleteSiteCrawl={() => deleteSiteCrawl(choseUrl)}
        />
      )}

      {statusBot && (
        // @ts-ignore
        <XmppProvider>
          <Box className="chatAssistantButton">
            {/* @ts-ignore */}
            <Chat
              roomJID={`${appId}_${aiBot.userId}-bot@xmpp.ethoradev.com`}
              config={{
                ...assistantChatConfig,
                assistantMode: { enabled: true, user },
              }}
            />
          </Box>
        </XmppProvider>
      )}
    </div>
  );
}
