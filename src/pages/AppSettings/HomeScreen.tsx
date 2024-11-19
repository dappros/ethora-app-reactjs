import { RadioGroup } from '@headlessui/react';

import { RadioButton } from '../../components/RadioButton';
import './HomeScreen.scss';
import { IconInfo } from '../../components/Icons/IconInfo';

interface Props {
  afterLoginPage: string;
  setAfterLoginPage: (s: string) => void;
  primaryColor: string;
}

export function HomeScreen({ afterLoginPage, setAfterLoginPage, primaryColor }: Props) {
  return (
    <div className="">
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
            Good for: <span className="font-bold">digital wallet</span> use case where quick access to User’s documents, assets or QR pass is important. 
          </span>
        </p>
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
            Good for: <span className="font-bold">community</span> use case where quick access to multiple conversations is important.
          </span>
        </p>
      </RadioGroup>
    </div>
  );
}
