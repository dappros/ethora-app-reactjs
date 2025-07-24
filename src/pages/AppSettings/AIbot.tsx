import { RadioGroup, Textarea } from '@headlessui/react';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from '@mui/material';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { SourcesSiteCrawlModal } from '../../components/modal/SourcesSiteCrawlModal';
import { RadioButton } from '../../components/RadioButton';
import { httpUpdateApp } from '../../http';
import { ModelAIbot, ModelAppDefaulRooom } from '../../models';

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

export function AIbot({
  appId,
  aiBot,
  setAiBot,
  defaultChatRooms,
  primaryColor,
  isDisabled,
  handleSiteCrawl,
  deleteSiteCrawl,
}: Props) {
  const [statusBot, setStatusBot] = useState<boolean>(false);
  const [showNewDocModal, setShowNewDocModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [url, setUrl] = useState<string>('');
  const [choseUrl, setChoseUrl] = useState<string>('');
  // const [scriptCode , setScriptCode] = useState<string>('');

  const scriptCode = useMemo(() => {
    return `<script src="https://dappros-wp-scripts.s3.us-east-2.amazonaws.com/ethora_assistant.js" 
    id="chat-content-assistant" data-bot-id="${appId}_${aiBot.userId}-bot@xmpp.ethoradev.com"></script>`;
  }, [appId, aiBot.userId]);

  useEffect(() => {
    if (aiBot.status) {
      setStatusBot(statusAiBot[aiBot.status]);
    }
  }, [aiBot.status]);

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

  const handleChatChange = (event: SelectChangeEvent<string>) => {
    const selectedJid = event.target.value;
    const selectedChat = defaultChatRooms.find(
      (chat) => chat.chatId === selectedJid
    );

    setAiBot({
      ...aiBot,
      chatId: selectedChat?.chatId || '',
      chat: selectedChat
        ? {
            _id: selectedChat.chatId,
            name: selectedChat.jid,
            title: selectedChat.title,
            description: '',
            type: '',
            picture: '',
          }
        : {
            _id: '',
            name: '',
            title: '',
            description: '',
            type: '',
            picture: '',
          },
    });
  };

  const handleGreetingChange = (value: string) => {
    setAiBot({
      ...aiBot,
      greetingMessage: value,
    });
  };

  const handleTriggerChange = (value: string) => {
    setAiBot({
      ...aiBot,
      trigger: value,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const memoChatName = useMemo(() => {
    if (!aiBot.chatId) {
      return 'None';
    }

    return aiBot.chatId;
  }, [aiBot.chatId]);

  useEffect(() => {
    if (aiBot.siteLinks && !!aiBot.siteLinks.length) {
      setUrl(aiBot.siteLinks[0]);
    }
  }, [aiBot.siteLinks]);

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
      <div className="font-semibold font-sans text-[16px] mb-4">Chat room</div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        Select Chat room where the bot should be deployed
      </p>
      <FormControl
        sx={{
          mb: 4,
          mt: 1,
          minWidth: 220,
          '& label': {
            color: primaryColor,
          },
          '& label.Mui-focused': {
            color: primaryColor,
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            '& fieldset': {
              borderColor: primaryColor,
            },
            '&:hover fieldset': {
              borderColor: primaryColor,
            },
            '&.Mui-focused fieldset': {
              borderColor: primaryColor,
            },
          },
        }}
      >
        <InputLabel id="demo-select-small-label">Chat</InputLabel>
        <Select
          labelId="demo-select-small-label"
          id="demo-select-small"
          label="Chat"
          value={memoChatName}
          onChange={(event: SelectChangeEvent<string>) =>
            handleChatChange(event)
          }
          sx={{ height: '42px' }}
        >
          <MenuItem value="None">
            <em>None</em>
          </MenuItem>
          {defaultChatRooms.map((chat) => (
            <MenuItem key={chat.chatId} value={chat.chatId}>
              {chat.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className="font-semibold font-sans text-[16px] mb-4">
        <span className="pr-2">Display Name</span>
        <Tooltip title="Only the app owner can change the bot's name." arrow>
          <WarningAmberOutlinedIcon
            style={{ color: '#f59e0b', fontSize: 18, cursor: 'pointer' }}
          />
        </Tooltip>
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        Which Display Name should the bot use?
      </p>
      <div className="flex flex-col gap-2 mb-8">
        <input
          disabled={isDisabled}
          type="text"
          className={classNames(
            'w-1/2 py-2 px-4 rounded-xl bg-gray-100 placeholder-gray-500 outline-none font-sans text-[16px] mb-4',
            isDisabled && 'opacity-50 cursor-not-allowed bg-gray-200'
          )}
          placeholder="First name"
          value={aiBot.user?.firstName}
          onChange={(e) =>
            setAiBot({
              ...aiBot,
              user: { ...aiBot.user, firstName: e.target.value },
            })
          }
        />
        <input
          disabled={isDisabled}
          type="text"
          className={classNames(
            'w-1/2 py-2 px-4 rounded-xl bg-gray-100 placeholder-gray-500 outline-none font-sans text-[16px] mb-4',
            isDisabled && 'opacity-50 cursor-not-allowed bg-gray-200'
          )}
          placeholder="Last name"
          value={aiBot.user?.lastName}
          onChange={(e) =>
            setAiBot({
              ...aiBot,
              user: { ...aiBot.user, lastName: e.target.value },
            })
          }
        />
      </div>
      <div className="font-semibold font-sans text-[16px] mb-4">
        Greeting message when joining the room
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        Bot sends this message as a greeting once launched. Delete for no
        message.
      </p>
      <div className="mb-8">
        <RadioGroup
          className="flex flex-col mb-8"
          value={aiBot.greetingMessage}
          onChange={handleGreetingChange}
        >
          <RadioButton
            className="mb-4"
            value="Hello, I am your AI assistant. How can I help you today?"
            label={'Hello, I am your AI assistant. How can I help you today?'}
          />
          <RadioButton className="mb-2" value="None" label="None" />
        </RadioGroup>
      </div>

      <div className="font-semibold font-sans text-[16px] mb-4">
        Response trigger
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        To which messages should the bot respond
      </p>
      <div className="mb-8">
        <RadioGroup
          className="flex flex-col mb-8"
          value={aiBot.trigger}
          onChange={handleTriggerChange}
        >
          <RadioButton
            className="mb-4"
            value="any_message"
            label="Any message from another user"
          />
          <RadioButton
            className="mb-2"
            value="/bot"
            label="Any messages addressed to the bot or with '/bot' prefix"
          />
        </RadioGroup>
      </div>

      <div className="font-semibold font-sans text-[16px] my-4">
        Integrating Chat into your website
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1 mb-8">
        Copy and paste the following code into your website’s HTML to add the AI
        Assistant. You’ll get a ready-to-use chat widget that will instantly
        appear on the page.
      </p>
      <div
        className={classNames(
          'relative bg-gray-100 rounded-md overflow-hidden'
        )}
      >
        <pre className="p-4 overflow-x-auto text-sm text-gray-800 whitespace-pre-wrap">
          <code>{scriptCode}</code>
        </pre>
        <div className="flex items-center justify-end px-2 pb-2">
          <Tooltip title={copied ? 'Copied' : 'Copy'}>
            <IconButton
              onClick={handleCopy}
              className="text-gray-600 hover:text-black"
              size="small"
            >
              {copied ? (
                <CheckIcon fontSize="small" />
              ) : (
                <ContentCopyIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <div className="font-semibold font-sans text-[16px] my-4">Prompt</div>
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

      <p className="font-sans text-sm flex items-center gap-1 pb-8">
        — [ section below only available for paid plans only ] —
      </p>

      <div className="font-semibold font-sans text-[16px] mb-4">
        RAG (Retrieval Augmented Generation)
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        This is a pre-processing layer that allows you to include much larger
        context for your AI Bot to use.
      </p>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        Your data will be stored into vector database embeddings.
      </p>
      <p className="font-sans text-sm pb-4 flex items-center gap-1 mb-8">
        Every time the AI Bot receives a request, the embedding layer will
        augment the request with relevant chunks from your knowledge base,
        making your bot more powerful and knowledgeable without the limitations
        of the prompt context size.
      </p>
      <div className="font-semibold font-sans text-[16px] mb-4">
        Upload documents
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1 mb-8">
        Drag & Drop your documents here for. Supported formats: TXT, CSV, JSON,
        DOC, PDF.
      </p>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="flex flex-col items-center">
          <IconButton>
            <FileUploadOutlinedIcon className="h-8 w-8 text-gray-400 mb-2" />
          </IconButton>
          {/* <Upload className="h-8 w-8 text-gray-400 mb-2" /> */}
          <p className="text-sm text-gray-500">Drag & Drop</p>
        </div>
      </div>
      <div className="font-semibold font-sans text-[16px] mb-4">Crawl URL</div>
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

      {showNewDocModal && (
        <SourcesSiteCrawlModal
          url={choseUrl}
          onClose={() => setShowNewDocModal(false)}
          deleteSiteCrawl={() => deleteSiteCrawl(choseUrl)}
        />
      )}
    </div>
  );
}
