import {
  Chat,
  XmppProvider,
  createAnonymousXmppCredentials,
} from '@ethora/ai-chat-widget';
import { Textarea } from '@headlessui/react';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, IconButton, Tab, Tooltip } from '@mui/material';
import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { SourcesSiteCrawlModal } from '../../components/modal/SourcesSiteCrawlModal';
import { httpUpdateApp } from '../../http';
import { ModelAIbot, ModelAppDefaulRooom } from '../../models';

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
  deleteSiteCrawl: (url: string) => void;
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
  const [choseUrl, setChoseUrl] = useState<string>('');
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
      <div className="font-semibold font-sans text-[16px] mb-4">Status</div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        AI bot is:{' '}
        <PowerSettingsNewIcon
          color={statusBot ? 'success' : 'error'}
          fontSize="small"
        />{' '}
        {statusBot ? 'online' : 'offline'}
      </p>
      <button
        className="px-16 py-2 rounded-xl hover:bg-brand-hover border border-brand-500 text-brand-500 flex items-center justify-center mb-8"
        onClick={handleStatusChange}
      >
        <span className="">{statusBot ? 'stop' : 'start'}</span>
      </button>

      <div className="font-semibold font-sans text-[16px] my-4">Code</div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        Use this code to integrate widget into your website or external app.
      </p>

      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="HTML Widget" value="1" />
            <Tab label="Wordpress" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1" style={{ padding: 0, paddingTop: 24 }}>
          <p className="font-sans text-sm pb-4 flex items-center gap-1">
            {`Insert this code anywhere inside your <body> tag:`}
          </p>
          <div className="relative rounded-md bg-gray-700">
            <div className="absolute top-1 right-1 z-10">
              <Tooltip title={copied ? 'Copied' : 'Copy'}>
                <IconButton onClick={() => handleCopy(scriptCode)} size="small">
                  {copied ? (
                    <CheckIcon
                      fontSize="small"
                      className="text-white hover:text-gray-300"
                    />
                  ) : (
                    <ContentCopyIcon
                      fontSize="small"
                      className="text-white hover:text-gray-300"
                    />
                  )}
                </IconButton>
              </Tooltip>
            </div>
            <SyntaxHighlighter
              language="html"
              style={oneDark}
              customStyle={{
                fontSize: '0.875rem',
                background: 'transparent',
                padding: '1rem 2.5rem 1rem 1rem',
                margin: 0,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                overflowX: 'auto',
              }}
              showLineNumbers={true}
              wrapLongLines={true}
              wrapLines={true}
              lineProps={{
                style: {
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                },
              }}
              codeTagProps={{
                style: {
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                },
              }}
            >
              {scriptCode}
            </SyntaxHighlighter>
          </div>
        </TabPanel>
        <TabPanel value="2" style={{ padding: 0, paddingTop: 24 }}>
          <p className="font-sans text-sm pb-4 flex items-center gap-1">
            Insert this bot ID in your Wordpress
            <a href="" className="text-brand-500">
              Ethora AI Assistant plugin
            </a>
            settings:
          </p>
          <div className="relative rounded-md bg-gray-700">
            <div className="absolute top-1 right-1 z-10">
              <Tooltip title={copied ? 'Copied' : 'Copy'}>
                <IconButton
                  onClick={() =>
                    handleCopy(
                      appId && aiBot.userId
                        ? `${appId}_${aiBot.userId}-bot@xmpp.ethoradev.com`
                        : ''
                    )
                  }
                  size="small"
                >
                  {copied ? (
                    <CheckIcon
                      fontSize="small"
                      className="text-white hover:text-gray-300"
                    />
                  ) : (
                    <ContentCopyIcon
                      fontSize="small"
                      className="text-white hover:text-gray-300"
                    />
                  )}
                </IconButton>
              </Tooltip>
            </div>
            <SyntaxHighlighter
              language="html"
              style={oneDark}
              customStyle={{
                fontSize: '0.875rem',
                background: 'transparent',
                padding: '1rem 2.5rem 1rem 1rem',
                margin: 0,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                overflowX: 'auto',
              }}
              showLineNumbers={false}
              wrapLongLines={true}
              wrapLines={true}
              lineProps={{
                style: {
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                },
              }}
              codeTagProps={{
                style: {
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                },
              }}
            >
              {appId && aiBot.userId
                ? `${appId}_${aiBot.userId}-bot@xmpp.ethoradev.com`
                : ''}
            </SyntaxHighlighter>
          </div>
        </TabPanel>
      </TabContext>

      <div className="font-semibold font-sans text-[16px] pt-8 pb-4">
        Prompt
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        Use to provide instructions on how the bot should behave. You may also
        copy&paste limited data on your specific business context the bot should
        be aware of.
      </p>
      <Textarea
        className="rounded-xl border outline-none w-full p-2 h-[196px] text-gray-500 border-gray-500 mb-8"
        placeholder="Enter prompt instructions here..."
        value={aiBot.prompt}
        onChange={(e) => setAiBot({ ...aiBot, prompt: e.target.value })}
      />

      <div className="font-semibold font-sans text-[16px] mb-4">
        <span>Crawl URL (</span>
        <button
          onClick={() => ragRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="text-blue-600 text-[14px] inline-flex items-center gap-[2px]"
        >
          <span>RAG feature</span> <InfoOutlinedIcon fontSize="small" />
        </button>
        <span>)</span>
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        Provide your website URL(s) in order for the system to ingest data from
        there.
      </p>
      <div className="flex gap-2 items-center justify-start mb-4">
        <input
          disabled={aiBot.siteLinks && !!aiBot.siteLinks.length}
          type="text"
          className={classNames(
            'w-1/2 py-2 px-4 rounded-xl bg-gray-100 placeholder-gray-500 outline-none font-sans text-[16px]',
            aiBot.siteLinks &&
              !!aiBot.siteLinks.length &&
              'opacity-50 cursor-not-allowed bg-gray-200'
          )}
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <IconButton
          disabled={aiBot.siteLinks && !!aiBot.siteLinks.length}
          className={classNames(
            aiBot.siteLinks &&
              !!aiBot.siteLinks.length &&
              'opacity-50 cursor-not-allowed bg-gray-200'
          )}
          aria-label="delete"
          onClick={() => handleSiteCrawl(url)}
        >
          <LanguageIcon />
        </IconButton>
      </div>
      {aiBot && aiBot.siteLinks && aiBot.siteLinks.length > 0 && (
        <div
          className="border rounded-lg"
          style={{
            maxHeight: '14em',
            overflowY: aiBot.siteLinks.length > 5 ? 'auto' : 'unset',
          }}
        >
          {aiBot.siteLinks.map((link, index) => (
            <div
              key={`${index}-${link}`}
              className={classNames(
                ' flex items-center justify-between hover:!bg-[#F5F7F9] p-3',
                {
                  '!bg-[#E7EDF9]': index % 2 === 0,
                }
              )}
            >
              <p>{link}</p>
              <IconButton
                aria-label="delete"
                color="error"
                onClick={() => {
                  setShowNewDocModal(true);
                  setChoseUrl(link);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          ))}
        </div>
      )}

      <div className="font-semibold font-sans text-[16px] pb-4 pt-10">
        <span> Upload documents (</span>
        <button
          onClick={() => ragRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="text-blue-600 text-[14px] inline-flex items-center gap-[2px]"
        >
          <span>RAG feature</span> <InfoOutlinedIcon fontSize="small" />
        </button>
        <span>)</span>
        <span className="text-xs text-gray-600 ml-2 p-2 border rounded-sm">
          Available in paid plans
        </span>
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1 mb-8">
        Drag & Drop your documents here for the system to ingest data from
        there. Supported formats: TXT, CSV, JSON, DOC, PDF.
      </p>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="flex flex-col items-center">
          <IconButton disabled>
            <FileUploadOutlinedIcon className="h-8 w-8 text-gray-400 mb-2" />
          </IconButton>
          {/* <Upload className="h-8 w-8 text-gray-400 mb-2" /> */}
          <p className="text-sm text-gray-500">Drag & Drop</p>
        </div>
      </div>

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
          url={choseUrl}
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
