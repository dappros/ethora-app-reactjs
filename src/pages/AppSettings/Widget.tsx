import { Checkbox, Field, Label, RadioGroup } from '@headlessui/react';
import { IconCheckbox } from '../../components/Icons/IconCheckbox';
import { IconInfo } from '../../components/Icons/IconInfo';
import { RadioButton } from '../../components/RadioButton';
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
  const onChange = (isOn: boolean, name: 'profile' | 'chats' | 'settings') => {
    setAvailableMenuItems({ ...availableMenuItems, [name]: isOn });
  };

  return (
    <div className="">
      <p className="font-sans text-[24px] font-medium pb-4 border-b border-gray-200">
        Home screen
      </p>
      <div className="text-sm text-gray-950 mb-8 py-4">
        Choose which screen your Users will see immediately after log in.
      </div>
      <RadioGroup
        value={afterLoginPage}
        onChange={setAfterLoginPage}
        aria-label="Server size"
      >
        <RadioButton className="mb-2" value="chats" label="List of Chats" />
        <p className="font-sans text-gray-500 text-[12px] mb-4">
          User will be see the list of chats available to them with tabs for
          Pinned, group and private chats.
        </p>
        <p className="p-2 flex items-center rounded-[8px] bg-brand-150 mb-8">
          <div className="mr-2">
            <IconInfo stroke={primaryColor} />
          </div>
          <span className="font-sans text-[12px]">
            Good for: <span className="font-bold">community</span> use case
            where quick access to multiple conversations is important.
          </span>
        </p>

        <RadioButton
          className="mb-2"
          value="profile"
          label="Profile / Wallet"
        />
        <p className="font-sans text-gray-500 text-[12px] mb-4">
          User will see their Profile and any documents or assets stored there.
          User will be able to share their profile or individual documents /
          assets.
        </p>
        <p className="p-2 flex items-center rounded-[8px] bg-brand-150 mb-8">
          <div className="mr-2">
            <IconInfo stroke={primaryColor} />
          </div>
          <span className="font-sans text-[12px]">
            Good for: <span className="font-bold">digital wallet</span> use case
            where quick access to User’s documents, assets or QR pass is
            important.
          </span>
        </p>

        <RadioButton className="mb-2" value="admin" label="Admin panel" />
        <p className="font-sans text-gray-500 text-[12px] mb-4">
          Users will see Admin first, as long as they have permissions.
        </p>
        <p className="p-2 flex items-center rounded-[8px] bg-brand-150 mb-8">
          <div className="mr-2">
            <IconInfo stroke={primaryColor} />
          </div>
          <span className="font-sans text-[12px]">
            Useful when you on-board many{' '}
            <span className="font-bold">admin users</span> or for a Base App on
            your dedicated server.
          </span>
        </p>
      </RadioGroup>

      <p className="font-sans text-[24px] font-medium pb-4 border-b border-gray-200">
        Menu
      </p>
      <p className="font-sans text-sm py-8">
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
        <Label className="cursor-pointer font-sans text-sm">Chats</Label>
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
        <Label className="cursor-pointer font-sans text-sm">Settings</Label>
      </Field>
      <p className="font-sans text-xs text-gray-500 mb-8">
        This is where your User can manage their visibility and privacy
        settings, as well as download their data or delete their account (GDPR
        and CCPA compliance requirement).
      </p>
    </div>
  );
}
