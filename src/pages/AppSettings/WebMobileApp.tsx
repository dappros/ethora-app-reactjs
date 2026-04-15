import { Textarea } from '@headlessui/react';
import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import { actionPostFile } from '../../actions';
import { IconDownload } from '../../components/Icons/IconDownload';
import { IconExternalLink } from '../../components/Icons/IconExternalLink';
import { IconInfo } from '../../components/Icons/IconInfo';
import { IconUpload } from '../../components/Icons/IconUpload';
import CopyButtonText from '../../components/UI/Buttons/CopyButtonText';

interface Props {
  domainName: string;
  setDomainName: (s: string) => void;
  firebaseWebConfigString: string;
  setFirebaseWebConfigString: (s: string) => void;
  primaryColor: string;
  onExternalClick: () => void;
  bundleId: string;
  setBundleId: (s: string) => void;
  setGoogleServicesJson: (s: string) => void;
  setGoogleServiceInfoPlist: (s: string) => void;
}

export function WebMobileApp({
  domainName,
  setDomainName,
  firebaseWebConfigString,
  setFirebaseWebConfigString,
  primaryColor,
  onExternalClick,
  bundleId,
  setBundleId,
  setGoogleServicesJson,
  setGoogleServiceInfoPlist,
}: Props) {
  const googleJsonRef = useRef<HTMLInputElement>(null);
  const plistFileRef = useRef<HTMLInputElement>(null);
  const hostedAppsRootDomain =
    import.meta.env.VITE_HOSTED_APPS_ROOT_DOMAIN ||
    import.meta.env.VITE_ROOT_DOMAIN ||
    'ethora.com';

  const onGoogleJsonRefChanges = (file: File | null) => {
    if (!file) {
      return;
    }

    actionPostFile(file).then((resp) => {
      setGoogleServicesJson(resp.data.results[0].location);
    });
  };

  const onPlistFileChange = (file: File | null) => {
    if (!file) {
      return;
    }

    actionPostFile(file).then((resp) => {
      setGoogleServiceInfoPlist(resp.data.results[0].location);
    });
  };

  return (
    <div className="">
      <p className="font-sans text-[24px] font-medium pb-4 border-b border-gray-200">
        Web app
      </p>
      <p className="font-sans text-[16px] font-semibold py-2">Domain name</p>
      <p className="font-sans text-sm mb-2">
        Your web app is hosted in our cloud with a complimentary 2nd level
        domain name available for Free plan users and 1st level domain name for
        Business plan users.
      </p>
      <div className="p-2 flex rounded-[8px] bg-brand-150 mb-4">
        <div className="mr-2">
          <IconInfo stroke={primaryColor} />
        </div>
        <span className="font-sans text-[12px]">
          Self-host option: just clone our engine from github, build and run it
          on your server.
        </span>
      </div>
      <div className="flex w-full max-w-[459px] relative mb-4 items-center">
        <input
          value={domainName}
          onChange={(e) => setDomainName(e.target.value)}
          placeholder="Your App Name"
          type="text"
          className=" p-2 w-full outline-none max-w-[308px] z-10 rounded-xl bg-gray-100 text-gray-500"
          name=""
          id="domain-input"
        />
        {/* <button onClick={onExternalClick} className='cursor-pointer'> */}
        <button className="text-black tex-[16px] inline-block py-2 px-[24px] ml-[-20px] bg-brand-300 rounded-xl">
          .{hostedAppsRootDomain}
        </button>
        {/* </button> */}
        <button
          onClick={onExternalClick}
          className="ml-4 w-[40px] h-[40px] p-2 flex items-center justify-center rounded-xl hover:bg-brand-hover"
        >
          <IconExternalLink />
        </button>
        <CopyButtonText textToCopy={`${domainName}.${hostedAppsRootDomain}`} />
      </div>
      <div className="flex flex-col items-start xl:flex-row xl:items-center mb-8">
        <div className="flex w-full mb-4 xl:mb-0 max-w-[377px] relative  mr-[32px]">
          <input
            placeholder="Your App Name"
            type="text"
            className="p-2  w-full outline-none max-w-[308px] z-10 rounded-xl bg-gray-100 text-gray-300"
            name=""
            id="domain-input"
          />
          <label
            className="text-gray-500 tex-[16px] inline-block py-2 px-[24px] ml-[-20px] bg-brand-300 rounded-xl"
            htmlFor="domain-input"
          >
            .com
          </label>
        </div>
        <div className="flex items-center">
          <button className="text-brand-500 font-varela text-[16px] mr-[20px] pointer-events-none text-gray-300">
            Upgrade to Business
          </button>
          <span>to unlock</span>
        </div>
      </div>

      <p className="font-sans text-base font-semibold mb-2">
        Google sign-in and Firebase analytics
      </p>
      <p className="font-sans text-sm leading-relaxed mb-4">
        Firebase credentials are required to allow your users to sign on via
        Google Account. Also this allows you to track your app usage analytics
        in your Firebase console. These options will be disabled if credentials
        are not provided.
      </p>
      <div className="p-2 flex rounded-[8px] bg-brand-150 mb-2">
        <div className="mr-2">
          <IconInfo stroke={primaryColor} />
        </div>
        <span className="font-sans text-[12px]">
          Copy paste the configuration from your Firebase Console
        </span>
      </div>
      <Textarea
        className="rounded-xl border outline-none w-full p-2 h-[196px] text-gray-500 border-gray-500"
        value={firebaseWebConfigString}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          setFirebaseWebConfigString(e.target.value)
        }
        placeholder='{
apiKey: "AIzaassdcefSyDgasd.-WrjLQadoYf0ads12dscxzsi_qO4g",
authDomain: "ethora-668e9.firebaseapp.com",
projectId: "ethora-668e9",
storageBucket: "ethora-668e9.appspot.com",
messagingSenderId: "972933470054",
appId: "1:972933470054:web:d4682e76ef02fdasdawdasd9b9cdaa7",
measurementId: "G-WHMasd7asdxcvX4asdC8"
}'
      />

      <p className="font-sans text-[24px] font-medium py-4 border-b border-gray-200">
        Mobile app
      </p>
      <div className="font-semibold font-sans text-[16px] mb-2">Mobile App</div>
      <div className="text-gray-500 font-sans text-[12px] mb-4">
        Please enter Bundle ID. Bundle ID should be unique to identify your app
        for Appstore and other purposes.
      </div>
      <div className="max-w-[416px] w-full">
        <input
          type="text"
          className="w-full py-2 px-4 rounded-xl bg-gray-100 placeholder-gray-500 outline-none font-sans text-[16px] mb-4"
          placeholder="Bundle ID"
          value={bundleId}
          onChange={(e) => setBundleId(e.target.value)}
        />
        <button className="w-full rounded-xl hover:bg-brand-hover border border-brand-500 text-brand-500 flex p-2 items-center justify-center mb-8">
          <IconDownload stroke={primaryColor}></IconDownload>
          <span className="ml-2">Prepare React Native Build</span>
        </button>
        <div className="font-semibold font-sans text-[16px] mb-4">
          Android build
        </div>
        <div className="font-semibold font-sans text-[14px] mb-2">
          Google Services JSON
        </div>
        <input
          type="file"
          ref={googleJsonRef}
          accept=".json"
          className="hidden"
          onChange={(e) =>
            onGoogleJsonRefChanges(e.target.files && e.target.files[0])
          }
        />
        <button
          className="w-full hover:bg-brand-hover rounded-xl border border-brand-500 text-brand-500 flex p-2 items-center justify-center mb-8"
          onClick={() => googleJsonRef.current?.click()}
        >
          <IconUpload stroke={primaryColor}></IconUpload>
          <span className="ml-2">Upload</span>
        </button>
        <div className="font-semibold text-sm mb-2">
          Firebase server key (for push notifications)
        </div>
        <input
          type="text"
          placeholder="Firebase Server Key"
          className="w-full py-2 px-4 rounded-xl bg-gray-100 placeholder-gray-500 outline-none font-sans text-[16px] mb-8"
        />
        <div className="font-semibold text-[16px] mb-4">IOS build</div>
        <div className="font-semibold text-sm mb-2">Google Services PLIST</div>
        <input
          type="file"
          ref={plistFileRef}
          accept=".plist"
          className="hidden"
          onChange={(e) =>
            onPlistFileChange(e.target.files && e.target.files[0])
          }
        />
        <button
          onClick={() => plistFileRef.current?.click()}
          className="w-full hover:bg-brand-hover rounded-xl border border-brand-500 text-brand-500 flex p-2 items-center justify-center mb-4"
        >
          <IconUpload></IconUpload>
          <span className="ml-2">Upload</span>
        </button>
        <div className="font-semibold text-sm mb-2">
          Push Notifications Certificate (Apple)
        </div>
        <button className="w-full hover:bg-brand-hover rounded-xl border border-brand-500 text-brand-500 flex p-2 items-center justify-center mb-4">
          <IconUpload></IconUpload>
          <span className="ml-2">Upload</span>
        </button>
      </div>
    </div>
  );
}
