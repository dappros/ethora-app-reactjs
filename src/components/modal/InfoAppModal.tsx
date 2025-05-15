import { Dialog, DialogPanel } from '@headlessui/react';
import { FC } from 'react';
import { toast } from 'react-toastify';
import { IconClose } from '../Icons/IconClose';
import { IconInfo } from '../Icons/IconInfo';

interface InfoAppModalProps {
  appName: string;
  domainName: string;
  primaryColor: string;
  show: boolean;
  onClose: () => void;
}

const InfoAppModal: FC<InfoAppModalProps> = ({
  appName,
  primaryColor,
  domainName,
  show,
  onClose,
}) => {
  return (
    <Dialog
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 transition duration-300"
      open={show}
      onClose={() => onClose()}
    >
      <DialogPanel className="p-4 sm:py-8 sm:px-8 bg-white rounded-3xl w-full max-w-[65%] m-8 relative">
        <button
          className="absolute top-[15px] right-[15px]"
          onClick={() => onClose()}
        >
          <IconClose />
        </button>

        <div className="font-varela text-[18px] md:text-[20px] mt-4 my-10">
          {`Awesome - your “${appName}” app is here! You will now see your Admin dashboard where you can:`}
        </div>

        <p className="font-sans text-[16px] font-semibold mb-2">
          1. Change appearance
        </p>
        <p className="font-sans text-sm p-4 pl-5">
          Open Appearance tab where you can add your logo, change colors etc for
          your App.
        </p>

        <p className="font-sans text-[16px] font-semibold mb-2">
          2. Manage chats
        </p>
        <p className="font-sans text-sm p-4 pl-5">
          A default “Main Chat” room has been pre-created and pinned for your
          Users.
        </p>

        <p className="font-sans text-[16px] font-semibold mb-2">
          3. Test and on-board users
        </p>
        <p className="font-sans text-sm p-4 pl-5">
          {`Your temporary web app URL is `}
          <span className="font-medium text-brand-500">{`${domainName}.ethora.com`}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${domainName}.ethora.com`);
              toast.success('Copied to clipboard!');
            }}
            className="ml-2 text-blue-600 hover:underline cursor-pointer"
          >
            📋 Copy
          </button>
          {`. You can send it to your beta testers or test it yourself in another browser*.`}
        </p>
        <div className="p-2 flex rounded-[8px] bg-brand-150 mb-4 ml-5">
          <div className="mr-2">
            <IconInfo stroke={primaryColor} />
          </div>
          <span className="font-sans text-[12px]">
            You’re logged as App Owner within our Base App. To test your own app
            as your End User, open the above URL in another browser or incognito
            mode. A disposable e-mail via a service like Mailinator or another
            Google account may be handy for your test “End User” account.
          </span>
        </div>

        <p className="font-sans text-sm p-4 pl-5">
          There are many more things you can do such as AI bots and
          integrations, changing your app URL, building your iOS/Android app,
          setting up your own Ethora server, internal Coin and gamification, but
          we suggest you start with the basics first.
        </p>

        <p className="text-center font-sans text-[16px] font-semibold mb-2">
          Good luck!
        </p>
      </DialogPanel>
    </Dialog>
  );
};

export default InfoAppModal;
