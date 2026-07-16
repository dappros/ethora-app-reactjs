import { Checkbox, Field, Label } from '@headlessui/react';
import { IconCheckbox } from '../../components/Icons/IconCheckbox';
import { useTranslation } from '../../i18n/useTranslation';
import './Menu.scss';

interface MenuItems {
  chats: boolean;
  profile: boolean;
  settings: boolean;
}

interface Props {
  availableMenuItems: MenuItems;
  setAvailableMenuItems: (items: MenuItems) => void;
}

export function Menu({ availableMenuItems, setAvailableMenuItems }: Props) {
  const { t } = useTranslation();
  const onChange = (isOn: boolean, name: 'profile' | 'chats' | 'settings') => {
    setAvailableMenuItems({ ...availableMenuItems, [name]: isOn });
  };
  return (
    <div className="">
      <p className="font-sans text-sm mb-8">
        {t('appSettingsMenu.description')}
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
          {t('appSettingsMenu.emailPasswordLabel')}
        </Label>
      </Field>
      <p className="font-sans text-xs text-gray-500 mb-8">
        {t('appSettingsMenu.emailPasswordDescription')}
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
          {t('appSettingsMenu.chatsLabel')}
        </Label>
      </Field>
      <p className="font-sans text-xs text-gray-500 mb-8">
        {t('appSettingsMenu.chatsDescription')}
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
          {t('appSettingsMenu.settingsLabel')}
        </Label>
      </Field>
      <p className="font-sans text-xs text-gray-500 mb-8">
        {t('appSettingsMenu.settingsDescription')}
      </p>
    </div>
  );
}
