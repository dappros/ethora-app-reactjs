import { RadioGroup, Textarea } from '@headlessui/react';
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
import { useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { IconExternalLink } from '../../components/Icons/IconExternalLink';
import { IconInfo } from '../../components/Icons/IconInfo';
import { RadioButton } from '../../components/RadioButton';
import CopyButtonText from '../../components/UI/Buttons/CopyButtonText';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelAIbot, ModelAppDefaulRooom } from '../../models';

interface Props {
  appId: string;
  domainName: string;
  setDomainName: (s: string) => void;
  firebaseWebConfigString: string;
  setFirebaseWebConfigString: (s: string) => void;
  primaryColor: string;
  setAiBot: (aiBot: ModelAIbot) => void;
  aiBot: ModelAIbot;
  onExternalClick: () => void;
  defaultChatRooms: Array<ModelAppDefaulRooom>;
  isDisabled: boolean;
}

export function WebApp({
  appId,
  aiBot,
  setAiBot,
  domainName,
  setDomainName,
  firebaseWebConfigString,
  setFirebaseWebConfigString,
  primaryColor,
  onExternalClick,
  defaultChatRooms,
  isDisabled,
}: Props) {
  const { t } = useTranslation();
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

  const hostedAppsRootDomain =
    import.meta.env.VITE_HOSTED_APPS_ROOT_DOMAIN ||
    import.meta.env.VITE_ROOT_DOMAIN ||
    'ethora.com';

  return (
    <div className="">
      <p className="font-sans text-[16px] font-semibold mb-2">
        {t('appSettingsWebApp.domainNameHeading')}
      </p>
      <p className="font-sans text-sm mb-2">
        {t('appSettingsWebApp.domainNameDescription')}
      </p>
      <div className="p-2 flex rounded-[8px] bg-brand-150 mb-4">
        <div className="mr-2">
          <IconInfo stroke={primaryColor} />
        </div>
        <span className="font-sans text-[12px]">
          {t('appSettingsWebApp.selfHostInfo')}
        </span>
      </div>
      <div className="flex w-full max-w-[459px] relative mb-4 items-center">
        <input
          value={domainName}
          onChange={(e) => setDomainName(e.target.value)}
          placeholder={t('appSettingsWebApp.appNamePlaceholder')}
          type="text"
          className=" p-2 w-full outline-none max-w-[308px] z-10 rounded-xl bg-gray-100 text-gray-500"
          name=""
          id="domain-input"
        />
        {/* <button onClick={onExternalClick} className='cursor-pointer'> */}
        <button className="text-black tex-[16px] inline-block py-2 px-[24px] ml-[-20px] bg-brand-300 rounded-xl">
          .{hostedAppsRootDomain}
        </button>
        {/* </button> */}
        <button
          onClick={onExternalClick}
          className="ml-4 w-[40px] h-[40px] p-2 flex items-center justify-center rounded-xl hover:bg-brand-hover"
        >
          <IconExternalLink />
        </button>
        <CopyButtonText textToCopy={`${domainName}.${hostedAppsRootDomain}`} />
      </div>
      <div className="flex flex-col items-start xl:flex-row xl:items-center mb-8">
        <div className="flex w-full mb-4 xl:mb-0 max-w-[377px] relative  mr-[32px]">
          <input
            placeholder={t('appSettingsWebApp.appNamePlaceholder')}
            type="text"
            className="p-2  w-full outline-none max-w-[308px] z-10 rounded-xl bg-gray-100 text-gray-300"
            name=""
            id="domain-input"
          />
          <label
            className="text-gray-500 tex-[16px] inline-block py-2 px-[24px] ml-[-20px] bg-brand-300 rounded-xl"
            htmlFor="domain-input"
          >
            .com
          </label>
        </div>
        <div className="flex items-center">
          <button className="text-brand-500 font-varela text-[16px] mr-[20px] pointer-events-none text-gray-300">
            {t('appSettingsWebApp.upgradeToBusinessButton')}
          </button>
          <span>{t('appSettingsWebApp.toUnlockText')}</span>
        </div>
      </div>

      <p className="font-sans text-base font-semibold mb-2">
        {t('appSettingsWebApp.googleFirebaseHeading')}
      </p>
      <p className="font-sans text-sm leading-relaxed mb-4">
        {t('appSettingsWebApp.googleFirebaseDescription')}
      </p>
      <div className="p-2 flex rounded-[8px] bg-brand-150 mb-2">
        <div className="mr-2">
          <IconInfo stroke={primaryColor} />
        </div>
        <span className="font-sans text-[12px]">
          {t('appSettingsWebApp.firebaseConfigInfo')}
        </span>
      </div>
      <Textarea
        className="rounded-xl border outline-none w-full p-2 h-[196px] text-gray-500 border-gray-500"
        value={firebaseWebConfigString}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          setFirebaseWebConfigString(e.target.value)
        }
        placeholder='{
apiKey: "AIzaassdcefSyDgasd.-WrjLQadoYf0ads12dscxzsi_qO4g",
authDomain: "ethora-668e9.firebaseapp.com",
projectId: "ethora-668e9",
storageBucket: "ethora-668e9.appspot.com",
messagingSenderId: "972933470054",
appId: "1:972933470054:web:d4682e76ef02fdasdawdasd9b9cdaa7",
measurementId: "G-WHMasd7asdxcvX4asdC8"
}'
      />

      <p className="font-sans text-[24px] font-medium py-4">
        {t('appSettingsWebApp.aiBotHeading')}
      </p>
      <div className="font-semibold font-sans text-[16px] mb-4">
        {t('appSettingsWebApp.chatRoomHeading')}
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        {t('appSettingsWebApp.selectChatRoomText')}
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
        <InputLabel id="demo-select-small-label">
          {t('appSettingsWebApp.chatSelectLabel')}
        </InputLabel>
        <Select
          labelId="demo-select-small-label"
          id="demo-select-small"
          label={t('appSettingsWebApp.chatSelectLabel')}
          value={memoChatName}
          onChange={(event: SelectChangeEvent<string>) =>
            handleChatChange(event)
          }
          sx={{ height: '42px' }}
        >
          <MenuItem value="None">
            <em>{t('appSettingsWebApp.noneLabel')}</em>
          </MenuItem>
          {defaultChatRooms.map((chat) => (
            <MenuItem key={chat.chatId} value={chat.chatId}>
              {chat.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className="font-semibold font-sans text-[16px] mb-4">
        <span className="pr-2">{t('appSettingsWebApp.displayNameHeading')}</span>
        <Tooltip title={t('appSettingsWebApp.displayNameTooltip')} arrow>
          <WarningAmberOutlinedIcon
            style={{ color: '#f59e0b', fontSize: 18, cursor: 'pointer' }}
          />
        </Tooltip>
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        {t('appSettingsWebApp.displayNameDescription')}
      </p>
      <div className="flex flex-col gap-2 mb-8">
        <input
          disabled={isDisabled}
          type="text"
          className={classNames(
            'w-1/2 py-2 px-4 rounded-xl bg-gray-100 placeholder-gray-500 outline-none font-sans text-[16px] mb-4',
            isDisabled && 'opacity-50 cursor-not-allowed bg-gray-200'
          )}
          placeholder={t('appSettingsWebApp.firstNamePlaceholder')}
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
          placeholder={t('appSettingsWebApp.lastNamePlaceholder')}
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
        {t('appSettingsWebApp.greetingMessageHeading')}
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        {t('appSettingsWebApp.greetingMessageDescription')}
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
            label={t('appSettingsWebApp.defaultGreetingLabel')}
          />
          <RadioButton
            className="mb-2"
            value="None"
            label={t('appSettingsWebApp.noneLabel')}
          />
        </RadioGroup>
      </div>

      <div className="font-semibold font-sans text-[16px] mb-4">
        {t('appSettingsWebApp.responseTriggerHeading')}
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        {t('appSettingsWebApp.responseTriggerDescription')}
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
            label={t('appSettingsWebApp.anyMessageLabel')}
          />
          <RadioButton
            className="mb-2"
            value="/bot"
            label={t('appSettingsWebApp.botPrefixLabel')}
          />
        </RadioGroup>
      </div>

      <div className="font-semibold font-sans text-[16px] mb-4">
        {t('appSettingsWebApp.additionalSettingsHeading')}
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        {t('appSettingsWebApp.additionalSettingsPrefix')}{' '}
        <NavLink
          to={`/app/admin/apps/${appId}/settings?tab=AI+Widget`}
          className="text-blue-600 underline"
        >
          {t('appSettingsWebApp.aiWidgetLinkText')}
        </NavLink>{' '}
        {t('appSettingsWebApp.additionalSettingsSuffix')}
      </p>
    </div>
  );
}
