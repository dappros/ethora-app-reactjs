import { Checkbox, Field, Label, RadioGroup } from '@headlessui/react';
import { IconCheckbox } from '../../components/Icons/IconCheckbox';
import { IconInfo } from '../../components/Icons/IconInfo';
import { RadioButton } from '../../components/RadioButton';
import { useTranslation } from '../../i18n/useTranslation';
import './HomeScreen.scss';
import './Menu.scss';

interface MenuItems {
  chats: boolean;
  profile: boolean;
  settings: boolean;
}

interface Props {
  afterLoginPage: string;
  setAfterLoginPage: (s: string) => void;
  primaryColor: string;
  availableMenuItems: MenuItems;
  setAvailableMenuItems: (items: MenuItems) => void;
}

export function Widget({
  afterLoginPage,
  setAfterLoginPage,
  primaryColor,
  availableMenuItems,
  setAvailableMenuItems,
}: Props) {
  const { t } = useTranslation();
  const onChange = (isOn: boolean, name: 'profile' | 'chats' | 'settings') => {
    setAvailableMenuItems({ ...availableMenuItems, [name]: isOn });
  };

  return (
    <div className="">
      <p className="font-sans text-[24px] font-medium pb-4 border-b border-gray-200">
        {t('appSettingsWidget.homeScreenHeading')}
      </p>
      <div className="text-sm text-gray-950 mb-8 py-4">
        {t('appSettingsWidget.homeScreenDescription')}
      </div>
      <RadioGroup
        value={afterLoginPage}
        onChange={setAfterLoginPage}
        aria-label={t('appSettingsWidget.radioGroupAriaLabel')}
      >
        <RadioButton
          className="mb-2"
          value="chats"
          label={t('appSettingsWidget.listOfChatsLabel')}
        />
        <p className="font-sans text-gray-500 text-[12px] mb-4">
          {t('appSettingsWidget.listOfChatsDescription')}
        </p>
        <p className="p-2 flex items-center rounded-[8px] bg-brand-150 mb-8">
          <div className="mr-2">
            <IconInfo stroke={primaryColor} />
          </div>
          <span className="font-sans text-[12px]">
            {t('appSettingsWidget.goodForLabel')}{' '}
            <span className="font-bold">
              {t('appSettingsWidget.communityWord')}
            </span>{' '}
            {t('appSettingsWidget.communityUseCase')}
          </span>
        </p>

        <RadioButton
          className="mb-2"
          value="profile"
          label={t('appSettingsWidget.profileWalletLabel')}
        />
        <p className="font-sans text-gray-500 text-[12px] mb-4">
          {t('appSettingsWidget.profileWalletDescription')}
        </p>
        <p className="p-2 flex items-center rounded-[8px] bg-brand-150 mb-8">
          <div className="mr-2">
            <IconInfo stroke={primaryColor} />
          </div>
          <span className="font-sans text-[12px]">
            {t('appSettingsWidget.goodForLabel')}{' '}
            <span className="font-bold">
              {t('appSettingsWidget.digitalWalletWord')}
            </span>{' '}
            {t('appSettingsWidget.digitalWalletUseCase')}
          </span>
        </p>

        <RadioButton
          className="mb-2"
          value="admin"
          label={t('appSettingsWidget.adminPanelLabel')}
        />
        <p className="font-sans text-gray-500 text-[12px] mb-4">
          {t('appSettingsWidget.adminPanelDescription')}
        </p>
        <p className="p-2 flex items-center rounded-[8px] bg-brand-150 mb-8">
          <div className="mr-2">
            <IconInfo stroke={primaryColor} />
          </div>
          <span className="font-sans text-[12px]">
            {t('appSettingsWidget.usefulWhenPrefix')}{' '}
            <span className="font-bold">
              {t('appSettingsWidget.adminUsersWord')}
            </span>{' '}
            {t('appSettingsWidget.adminUsersSuffix')}
          </span>
        </p>
      </RadioGroup>

      <p className="font-sans text-[24px] font-medium pb-4 border-b border-gray-200">
        {t('appSettingsWidget.menuHeading')}
      </p>
      <p className="font-sans text-sm py-8">
        {t('appSettingsWidget.menuDescription')}
      </p>
      <Field className="flex items-center cursor-pointer mb-2">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={availableMenuItems.profile}
          onChange={(isOn) => onChange(isOn, 'profile')}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">
          {t('appSettingsWidget.emailPasswordLabel')}
        </Label>
      </Field>
      <p className="font-sans text-xs text-gray-500 mb-8">
        {t('appSettingsWidget.emailPasswordDescription')}
      </p>
      <Field className="flex items-center cursor-pointer mb-2">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={availableMenuItems.chats}
          onChange={(isOn) => onChange(isOn, 'chats')}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">
          {t('appSettingsWidget.chatsLabel')}
        </Label>
      </Field>
      <p className="font-sans text-xs text-gray-500 mb-8">
        {t('appSettingsWidget.chatsDescription')}
      </p>

      <Field className="flex items-center cursor-pointer mb-2">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={availableMenuItems.settings}
          onChange={(isOn) => onChange(isOn, 'settings')}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">
          {t('appSettingsWidget.settingsLabel')}
        </Label>
      </Field>
      <p className="font-sans text-xs text-gray-500 mb-8">
        {t('appSettingsWidget.settingsDescription')}
      </p>
    </div>
  );
}
