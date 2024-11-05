import { Field, Label, Radio, RadioGroup } from '@headlessui/react';

import './HomeScreen.scss';

interface Props {
  afterLoginPage: string;
  setAfterLoginPage: (s: string) => void;
}

export function HomeScreen({ afterLoginPage, setAfterLoginPage }: Props) {
  return (
    <div className="settings-home-screen">
      <div className="body2 mbc-32">
        Choose which screen your Users will see immediately after log in.
      </div>
      <RadioGroup
        value={afterLoginPage}
        onChange={setAfterLoginPage}
        aria-label="Server size"
      >
        <Field className="radio-button">
          <Radio value={'profile'} className="radio-button-input"></Radio>
          <Label className="body2 radio-button-label">Profile / Wallet</Label>
        </Field>
        <p className="caption">
          User will see their Profile and any documents or assets stored there.
          User will be able to share their profile or individual documents /
          assets.
        </p>
        <Field className="radio-button">
          <Radio value={'chats'} className="radio-button-input"></Radio>
          <Label className="body2 radio-button-label">List of Chats</Label>
        </Field>
        <p className="caption">
          User will be see the list of chats available to them with tabs for
          Pinned, group and private chats.
        </p>
      </RadioGroup>
    </div>
  );
}
