import { RadioGroup } from '@headlessui/react';
import { RadioButton } from '../../components/RadioButton';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  defaultAccessAssetsOpen: boolean;
  setDefaultAccessAssetsOpen: (on: boolean) => void;
  defaultAccessProfileOpen: boolean;
  setDefaultAccessProfileOpen: (on: boolean) => void;
  usersCanFree: boolean;
  setUsersCanFree: (on: boolean) => void;
}

export function Visibility({
  defaultAccessAssetsOpen,
  setDefaultAccessAssetsOpen,
  defaultAccessProfileOpen,
  setDefaultAccessProfileOpen,
  usersCanFree,
  setUsersCanFree,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="">
      <div className="font-sans text-sm">
        {t('appSettingsVisibility.description1')}
      </div>
      <div className="font-sans text-sm mb-8">
        {t('appSettingsVisibility.description2')}
      </div>
      <div className="text-base font-semibold font-sans mb-2">
        {t('appSettingsVisibility.profilesVisibilityHeading')}
      </div>
      <p className="text-gray-500 text-sm font-sans">
        {t('appSettingsVisibility.profilesVisibilityDesc1')}
      </p>
      <p className="text-gray-500 text-sm font-sans mb-4">
        {t('appSettingsVisibility.profilesVisibilityDesc2')}
      </p>

      <RadioGroup
        value={defaultAccessProfileOpen}
        onChange={setDefaultAccessProfileOpen}
        className="flex flex-col mb-8"
      >
        <RadioButton
          className="mb-4"
          value={true}
          label={t('appSettingsVisibility.profilesViewableLabel')}
        />
        <RadioButton
          className="mb-2"
          value={false}
          label={t('appSettingsVisibility.profilesSharedExplicitlyLabel')}
        />
      </RadioGroup>

      <div className="text-base font-semibold font-sans mb-2">
        {t('appSettingsVisibility.assetsVisibilityHeading')}
      </div>
      <div className="text-gray-500 text-sm font-sans">
        {t('appSettingsVisibility.assetsVisibilityDesc1')}
      </div>
      <div className="text-gray-500 text-sm font-sans">
        {t('appSettingsVisibility.assetsVisibilityDesc2')}
      </div>
      <div className="text-gray-500 text-sm font-sans">
        {t('appSettingsVisibility.assetsVisibilityDesc3')}
      </div>
      <div className="text-gray-500 text-sm font-sans mb-4">
        {t('appSettingsVisibility.assetsVisibilityDesc4')}
      </div>
      <RadioGroup
        value={defaultAccessAssetsOpen}
        onChange={setDefaultAccessAssetsOpen}
        className="flex flex-col mb-8"
      >
        <RadioButton
          className="mb-4"
          value={true}
          label={t('appSettingsVisibility.assetsViewableLabel')}
        />
        <RadioButton
          className="mb-2"
          value={false}
          label={t('appSettingsVisibility.assetsHiddenLabel')}
        />
      </RadioGroup>

      <div className="text-base font-semibold font-sans mb-2">
        {t('appSettingsVisibility.appLockedAccountsHeading')}
      </div>
      <div className="text-gray-500 text-sm font-sans">
        {t('appSettingsVisibility.appLockedDesc1')}
      </div>
      <div className="text-gray-500 text-sm font-sans mb-4">
        {t('appSettingsVisibility.appLockedDesc2')}
      </div>
      <RadioGroup
        value={usersCanFree}
        onChange={setUsersCanFree}
        className="mb-8"
      >
        <RadioButton
          className="mb-4"
          value={true}
          label={t('appSettingsVisibility.accountsTiedLabel')}
        />
        <RadioButton
          className="mb-2"
          value={false}
          label={t('appSettingsVisibility.accountsUnlockedLabel')}
        />
      </RadioGroup>
    </div>
  );
}
