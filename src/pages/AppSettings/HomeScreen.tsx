import { RadioGroup } from '@headlessui/react';

import { IconInfo } from '../../components/Icons/IconInfo';
import { RadioButton } from '../../components/RadioButton';
import { useTranslation } from '../../i18n/useTranslation';
import './HomeScreen.scss';

interface Props {
  afterLoginPage: string;
  setAfterLoginPage: (s: string) => void;
  primaryColor: string;
}

export function HomeScreen({
  afterLoginPage,
  setAfterLoginPage,
  primaryColor,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="">
      <div className="text-sm text-gray-950 mb-8">
        {t('appSettingsHomeScreen.description')}
      </div>
      <RadioGroup
        value={afterLoginPage}
        onChange={setAfterLoginPage}
        aria-label={t('appSettingsHomeScreen.radioGroupAriaLabel')}
      >
        <RadioButton
          className="mb-2"
          value="chats"
          label={t('appSettingsHomeScreen.listOfChatsLabel')}
        />
        <p className="font-sans text-gray-500 text-[12px] mb-4">
          {t('appSettingsHomeScreen.listOfChatsDescription')}
        </p>
        <p className="p-2 flex items-center rounded-[8px] bg-brand-150 mb-8">
          <div className="mr-2">
            <IconInfo stroke={primaryColor} />
          </div>
          <span className="font-sans text-[12px]">
            {t('appSettingsHomeScreen.goodForLabel')}{' '}
            <span className="font-bold">
              {t('appSettingsHomeScreen.communityWord')}
            </span>{' '}
            {t('appSettingsHomeScreen.communityUseCase')}
          </span>
        </p>

        <RadioButton
          className="mb-2"
          value="profile"
          label={t('appSettingsHomeScreen.profileWalletLabel')}
        />
        <p className="font-sans text-gray-500 text-[12px] mb-4">
          {t('appSettingsHomeScreen.profileWalletDescription')}
        </p>
        <p className="p-2 flex items-center rounded-[8px] bg-brand-150 mb-8">
          <div className="mr-2">
            <IconInfo stroke={primaryColor} />
          </div>
          <span className="font-sans text-[12px]">
            {t('appSettingsHomeScreen.goodForLabel')}{' '}
            <span className="font-bold">
              {t('appSettingsHomeScreen.digitalWalletWord')}
            </span>{' '}
            {t('appSettingsHomeScreen.digitalWalletUseCase')}
          </span>
        </p>

        <RadioButton
          className="mb-2"
          value="admin"
          label={t('appSettingsHomeScreen.adminPanelLabel')}
        />
        <p className="font-sans text-gray-500 text-[12px] mb-4">
          {t('appSettingsHomeScreen.adminPanelDescription')}
        </p>
        <p className="p-2 flex items-center rounded-[8px] bg-brand-150 mb-8">
          <div className="mr-2">
            <IconInfo stroke={primaryColor} />
          </div>
          <span className="font-sans text-[12px]">
            {t('appSettingsHomeScreen.usefulWhenPrefix')}{' '}
            <span className="font-bold">
              {t('appSettingsHomeScreen.adminUsersWord')}
            </span>{' '}
            {t('appSettingsHomeScreen.adminUsersSuffix')}
          </span>
        </p>
      </RadioGroup>
    </div>
  );
}
