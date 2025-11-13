import { Checkbox, Field, Label } from '@headlessui/react';
import { IconCheckbox } from '../../components/Icons/IconCheckbox';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

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
  firebaseWebConfigString: string;
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
  firebaseWebConfigString,
}: Props) {
  const isEmptyFirebaseConfig = !firebaseWebConfigString || firebaseWebConfigString.trim() === '';

  const WarningMessage = ({ text }: { text: string }) => {
    if (!isEmptyFirebaseConfig) {
      return <p className="font-sans text-[12px] text-gray-500 mb-4">{text}</p>;
    }

    return (
      <div className="flex items-start gap-2 mb-4">
        <WarningAmberIcon 
          sx={{ 
            fontSize: 16, 
            color: '#f59e0b',
            marginTop: '2px',
            flexShrink: 0
          }} 
        />
        <p className="font-sans text-[14px] text-yellow-600 font-medium">
          {text}
        </p>
      </div>
    );
  };

  return (
    <div className="">
      <p className="font-sans text-sm mb-8">
        Choose which sign on options to enable in your App. This controls how
        your Users create new accounts and login.
      </p>
      <p className="font-sans text-[24px] font-medium mb-2">Standard login</p>
      <p className="font-sans text-[12px] text-gray-500 mb-4">
        User is required to create an account with their e-mail and memorize the
        password. They will need to confirm their e-mail address by clicking a
        link. E-mails from the platform can be customized with your branding.
      </p>
      {/* checkbox */}
      <Field className="flex items-center cursor-pointer mb-8">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={enableEmail}
          onChange={setEnableEmail}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">
          Email + Password
        </Label>
      </Field>
      <p className="font-sans text-[24px] font-medium mb-2">Social Sign-On</p>
      <p className="font-sans text-[12px] text-gray-500 mb-4">
        Allows your users to sign on into your app with popular platform
        accounts. It will still create an account but the User won’t have to
        memorize their password.
      </p>
      <Field className="flex items-center cursor-pointer mb-2">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={enableGoogle}
          onChange={setEnableGoogle}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">Google</Label>
      </Field>
      <WarningMessage text="Make sure to add your App Firebase settings for this to work." />
      <Field className="flex items-center cursor-pointer mb-2">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={enableApple}
          onChange={setEnableApple}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">Apple</Label>
      </Field>
      <WarningMessage text="Make sure to add your App Firebase settings for this to work." />
      <Field className="flex items-center cursor-pointer mb-2">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={enableFacebook}
          onChange={setEnableFacebook}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">Facebook</Label>
      </Field>
      <WarningMessage text="Make sure to add your App Firebase settings for this to work." />
      <Field className="flex items-center cursor-pointer mb-2">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={enableMetamask}
          onChange={setEnableMetamask}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">Metamask</Label>
      </Field>
      <p className="font-sans text-[12px] text-gray-500 mb-8">
        Web3 projects will benefit from signing in with their existing crypto
        wallet. 
      </p>
      <p className="font-sans text-[24px] font-medium mb-2">
        Custom backend integration
      </p>
      <p className="font-sans text-[12px] text-gray-500 mb-4">
        Some projects prefer to create accounts for Users programmatically,
        connecting their existing legacy software with Ethora. In this case,
        your legacy software will control accounts via our Users API (or a
        custom endpoint) and your Users will either (a) login via e-mail +
        password route, (b) login via a custom login screen, or (c) be logged on
        automatically as part of an embedded experience. See Documentation and
        use Forum or contact us for help with this option.
      </p>
      <Field className="flex items-center cursor-pointer mb-2" disabled>
        <Checkbox className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 data-[disabled]:border-gray-300 flex justify-center items-center"></Checkbox>
        <Label className="cursor-pointer font-sans text-sm data-[disabled]:text-gray-300">
          API integration with your backend
        </Label>
      </Field>
    </div>
  );
}
