import { RadioGroup } from '@headlessui/react';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
} from '@mui/material';
import classNames from 'classnames';
import { useMemo, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { actionPostFile } from '../../actions';
import { IconDownload } from '../../components/Icons/IconDownload';
import { IconUpload } from '../../components/Icons/IconUpload';
import { RadioButton } from '../../components/RadioButton';
import { ModelAIbot, ModelAppDefaulRooom } from '../../models';

interface Props {
  appId: string;
  bundleId: string;
  setBundleId: (s: string) => void;
  setGoogleServicesJson: (s: string) => void;
  setGoogleServiceInfoPlist: (s: string) => void;
  primaryColor: string;
  setAiBot: (aiBot: ModelAIbot) => void;
  aiBot: ModelAIbot;
  defaultChatRooms: Array<ModelAppDefaulRooom>;
  isDisabled: boolean;
}

export function MobileApp({
  appId,
  aiBot,
  setAiBot,
  bundleId,
  setBundleId,
  setGoogleServicesJson,
  setGoogleServiceInfoPlist,
  primaryColor,
  defaultChatRooms,
  isDisabled,
}: Props) {
  const googleJsonRef = useRef<HTMLInputElement>(null);
  const plistFileRef = useRef<HTMLInputElement>(null);

  const onGoogleJsonRefChanges = (file: File | null) => {
    if (!file) {
      return;
    }

    actionPostFile(file).then((resp) => {
      setGoogleServicesJson(resp.data.results[0].location);
    });
  };

  const onPlistFileChange = (file: File | null) => {
    if (!file) {
      return;
    }

    actionPostFile(file).then((resp) => {
      setGoogleServiceInfoPlist(resp.data.results[0].location);
    });
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

  const memoChatName = useMemo(() => {
    if (!aiBot.chatId) {
      return 'None';
    }

    return aiBot.chatId;
  }, [aiBot.chatId]);

  return (
    <div>
      <div className="font-semibold font-sans text-[16px] mb-2">Mobile App</div>
      <div className="text-gray-500 font-sans text-[12px] mb-4">
        Please enter Bundle ID. Bundle ID should be unique to identify your app
        for Appstore and other purposes.
      </div>
      <div className="max-w-[416px] w-full">
        <input
          type="text"
          className="w-full py-2 px-4 rounded-xl bg-gray-100 placeholder-gray-500 outline-none font-sans text-[16px] mb-4"
          placeholder="Bundle ID"
          value={bundleId}
          onChange={(e) => setBundleId(e.target.value)}
        />
        <button className="w-full rounded-xl hover:bg-brand-hover border border-brand-500 text-brand-500 flex p-2 items-center justify-center mb-8">
          <IconDownload stroke={primaryColor}></IconDownload>
          <span className="ml-2">Prepare React Native Build</span>
        </button>
        <div className="font-semibold font-sans text-[16px] mb-4">
          Android build
        </div>
        <div className="font-semibold font-sans text-[14px] mb-2">
          Google Services JSON
        </div>
        <input
          type="file"
          ref={googleJsonRef}
          accept=".json"
          className="hidden"
          onChange={(e) =>
            onGoogleJsonRefChanges(e.target.files && e.target.files[0])
          }
        />
        <button
          className="w-full hover:bg-brand-hover rounded-xl border border-brand-500 text-brand-500 flex p-2 items-center justify-center mb-8"
          onClick={() => googleJsonRef.current?.click()}
        >
          <IconUpload stroke={primaryColor}></IconUpload>
          <span className="ml-2">Upload</span>
        </button>
        <div className="font-semibold text-sm mb-2">
          Firebase server key (for push notifications)
        </div>
        <input
          type="text"
          placeholder="Firebase Server Key"
          className="w-full py-2 px-4 rounded-xl bg-gray-100 placeholder-gray-500 outline-none font-sans text-[16px] mb-8"
        />
        <div className="font-semibold text-[16px] mb-4">IOS build</div>
        <div className="font-semibold text-sm mb-2">Google Services PLIST</div>
        <input
          type="file"
          ref={plistFileRef}
          accept=".plist"
          className="hidden"
          onChange={(e) =>
            onPlistFileChange(e.target.files && e.target.files[0])
          }
        />
        <button
          onClick={() => plistFileRef.current?.click()}
          className="w-full hover:bg-brand-hover rounded-xl border border-brand-500 text-brand-500 flex p-2 items-center justify-center mb-4"
        >
          <IconUpload></IconUpload>
          <span className="ml-2">Upload</span>
        </button>
        <div className="font-semibold text-sm mb-2">
          Push Notifications Certificate (Apple)
        </div>
        <button className="w-full hover:bg-brand-hover rounded-xl border border-brand-500 text-brand-500 flex p-2 items-center justify-center mb-4">
          <IconUpload></IconUpload>
          <span className="ml-2">Upload</span>
        </button>
      </div>

      <p className="font-sans text-[24px] font-medium py-4">AI Bot</p>
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

      <div className="font-semibold font-sans text-[16px] mb-4">
        Additional settings
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        Use{' '}
        <NavLink
          to={`/app/admin/apps/${appId}/settings?tab=AI+Widget`}
          className="text-blue-600 underline"
        >
          AI Widget
        </NavLink>{' '}
        tab for additional settings such as prompt, URL crawling and documents
        upload.
      </p>
    </div>
  );
}
