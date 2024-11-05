import { Checkbox, Field, Label } from '@headlessui/react';

import './SignonOptions.scss';

interface Props {
  enableEmail: boolean;
  setEnableEmail: (on: boolean) => void;
  enableGoogle: boolean;
  setEnableGoogle: (on: boolean) => void;
  enableApple: boolean;
  setEnableApple: (on: boolean) => void;
  enableFacebook: boolean;
  setEnableFacebook: (on: boolean) => void;
  enableMetamask: boolean;
  setEnableMetamask: (on: boolean) => void;
}

export function SignonOptions({
  enableEmail,
  setEnableEmail,
  enableGoogle,
  setEnableGoogle,
  enableApple,
  setEnableApple,
  enableFacebook,
  setEnableFacebook,
  enableMetamask,
  setEnableMetamask,
}: Props) {
  return (
    <div className="settings-signon">
      <p className="mbc-32">
        Choose which sign on options to enable in your App. This controls how
        your Users create new accounts and login.
      </p>
      <p className="subtitle1">Standart login</p>
      <p className="caption">
        User is required to create an account with their e-mail and memorize the
        password. They will need to confirm their e-mail address by clicking a
        link. E-mails from the platform can be customized with your branding.
      </p>
      <Field className="checkbox">
        <Checkbox
          className="checkbox-input"
          checked={enableEmail}
          onChange={setEnableEmail}
        ></Checkbox>
        <Label className="label mbc-32">Email + Password</Label>
      </Field>
      <p className="subtitle1">Social Sign-On</p>
      <p className="caption">
        Allows your users to sign on into your app with popular platform
        accounts. It will still create an account but the User won’t have to
        memorize their password.
      </p>
      <Field className="checkbox  mb-6">
        <Checkbox
          className="checkbox-input"
          checked={enableGoogle}
          onChange={setEnableGoogle}
        ></Checkbox>
        <Label className="label">Google</Label>
      </Field>
      <p className="caption">
        Make sure to add your App Firebase settings for this to work.
      </p>
      <Field className="checkbox  mb-6">
        <Checkbox
          className="checkbox-input"
          checked={enableApple}
          onChange={setEnableApple}
        ></Checkbox>
        <Label className="label">Apple</Label>
      </Field>
      <p className="caption mbc-16px">
        Make sure to add your App Firebase settings for this to work.
      </p>
      <Field className="checkbox  mb-6">
        <Checkbox
          className="checkbox-input"
          checked={enableFacebook}
          onChange={setEnableFacebook}
        ></Checkbox>
        <Label className="label">Facebook</Label>
      </Field>
      <p className="caption mbc-16px">
        Make sure to add your App Firebase settings for this to work.
      </p>
      <Field className="checkbox  mb-6">
        <Checkbox
          className="checkbox-input"
          checked={enableMetamask}
          onChange={setEnableMetamask}
        ></Checkbox>
        <Label className="label">Metamask</Label>
      </Field>
      <p className="caption mbc-32">
        Web3 projects will benefit from signing in with their existing crypto
        wallet. 
      </p>
      <p className="subtitle1">Custom backend integration</p>
      <p className="caption mbc-16">
        Some projects prefer to create accounts for Users programmatically,
        connecting their existing legacy software with Ethora. In this case,
        your legacy software will control accounts via our Users API (or a
        custom endpoint) and your Users will either (a) login via e-mail +
        password route, (b) login via a custom login screen, or (c) be logged on
        automatically as part of an embedded experience. See Documentation and
        use Forum or contact us for help with this option.
      </p>
      <Field className="checkbox  mb-6">
        <Checkbox className="checkbox-input" disabled></Checkbox>
        <Label className="label">API integration with your backend</Label>
      </Field>
    </div>
  );
}
