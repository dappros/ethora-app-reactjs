import { RadioGroup } from '@headlessui/react';

import { RadioButton } from '../../components/RadioButton';
import './HomeScreen.scss';

interface Props {
  afterLoginPage: string;
  setAfterLoginPage: (s: string) => void;
}

export function HomeScreen({ afterLoginPage, setAfterLoginPage }: Props) {
  return (
    <div className="settings-home-screen">
      <div className="text-sm text-gray-950 mb-8">
        Choose which screen your Users will see immediately after log in.
      </div>
      <RadioGroup
        value={afterLoginPage}
        onChange={setAfterLoginPage}
        aria-label="Server size"
      >
        <RadioButton
          className="mb-2"
          value="profile"
          label="Profile / Wallet"
        />
        <p className="caption">
          User will see their Profile and any documents or assets stored there.
          User will be able to share their profile or individual documents /
          assets.
        </p>
        <RadioButton className="mb-2" value="chats" label="List of Chats" />
        <p className="caption">
          User will be see the list of chats available to them with tabs for
          Pinned, group and private chats.
        </p>
      </RadioGroup>
    </div>
  );
}
