import { Checkbox, Field, Label } from '@headlessui/react';
import './Menu.scss';
import { IconCheckbox } from '../../components/Icons/IconCheckbox';

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
  const onChange = (isOn: boolean, name: 'profile' | 'chats' | 'settings') => {
    setAvailableMenuItems({ ...availableMenuItems, [name]: isOn });
  };
  return (
    <div className="">
      <p className="font-sans text-sm mb-8">
        Manage items that are displayed in your App menu.
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
          Email + Password
        </Label>
      </Field>
      <p className="font-sans text-xs text-gray-500 mb-8">
        Each of your Users is equipped with a personal digital wallet. User will
        see their Assets (wallet contents) in their Profile screen. Depending on
        configuration, the Profile and Assets can also be visible to other
        Users.
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
          Chats
        </Label>
      </Field>
      <p className="font-sans text-xs text-gray-500 mb-8">
        Shows a list of Chats including your default Pinned Chats and also group
        and private conversations that your User is a part of.
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
          Settings
        </Label>
      </Field>
      <p className="font-sans text-xs text-gray-500 mb-8">
        This is where your User can manage their visibility and privacy
        settings, as well as download their data or delete their account (GDPR
        and CCPA compliance requirement).
      </p>
    </div>
  );
}
