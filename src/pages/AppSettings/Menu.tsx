import { Checkbox, Field, Label, Switch } from '@headlessui/react';
import { IconCheckbox } from '../../components/Icons/IconCheckbox';
import { useTranslation } from '../../i18n/useTranslation';
import type { ModelApp } from '../../models';
import './Menu.scss';

type MenuItems = ModelApp['availableMenuItems'];

const memberLinks = [
  ['projects', 'nav.apps'],
  ['assistants', 'nav.ai'],
  ['license', 'nav.license'],
  ['help', 'nav.help'],
] as const;

interface Props {
  availableMenuItems: MenuItems;
  setAvailableMenuItems: (items: MenuItems) => void;
}

export function Menu({ availableMenuItems, setAvailableMenuItems }: Props) {
  const { t } = useTranslation();
  const onChange = (isOn: boolean, name: keyof MenuItems) => {
    setAvailableMenuItems({ ...availableMenuItems, [name]: isOn });
  };
  return (
    <div className="">
      <fieldset className="mb-8 rounded-xl border border-gray-200 px-4 pb-2">
        <legend className="px-1 text-base font-semibold">{t('appSettingsMenu.memberLinksTitle')}</legend>
        <p className="mb-2 text-sm text-gray-600">{t('appSettingsMenu.memberLinksDescription')}</p>
        {memberLinks.map(([key, label]) => (
          <Field key={key} className="flex min-h-11 items-center justify-between gap-4 border-b border-gray-200 last:border-b-0">
            <Label className="cursor-pointer text-sm font-medium">{t(label)}</Label>
            <Switch
              checked={availableMenuItems[key] !== false}
              onChange={(visible) => onChange(visible, key)}
              className="group relative h-6 w-11 shrink-0 rounded-full bg-gray-300 data-[checked]:bg-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              <span aria-hidden="true" className="absolute left-1 top-1 size-4 rounded-full bg-[#fff] shadow transition-transform group-data-[checked]:translate-x-5" />
            </Switch>
          </Field>
        ))}
      </fieldset>
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
