import { Textarea } from '@headlessui/react';
import { IconInfo } from '../../components/Icons/IconInfo';
import './WebApp.scss';

interface Props {
  domainName: string;
  setDomainName: (s: string) => void;
  firebaseWebConfigString: string;
  setFirebaseWebConfigString: (s: string) => void;
  primaryColor: string;
}

export function WebApp({
  domainName,
  setDomainName,
  firebaseWebConfigString,
  setFirebaseWebConfigString,
  primaryColor,
}: Props) {
  return (
    <div className="">
      <p className="font-sans text-[16px] font-medium mb-2">Domain name</p>
      <p className="font-sans text-sm mb-2">
        Your web app is hosted in our cloud with a complimentary 2nd level
        domain name available for Free plan users and 1st level domain name for
        Business plan users.
      </p>
      <p className="p-2 flex rounded-[8px] bg-brand-150 mb-4">
        <div className="mr-2">
          <IconInfo stroke={primaryColor} />
        </div>
        <span className="font-sans text-[12px]">
          Self-host option: just clone our engine from github, build and run it
          on your server.
        </span>
      </p>
      <div className="flex w-full max-w-[459px] relative mb-4">
        <input
          value={domainName}
          onChange={(e) => setDomainName(e.target.value)}
          placeholder="Your App Name"
          type="text"
          className=" p-2 w-full outline-none max-w-[308px] z-10 rounded-xl bg-gray-100 text-gray-500"
          name=""
          id="domain-input"
        />
        <label
          className="text-black tex-[16px] inline-block py-2 px-[24px] ml-[-20px] bg-brand-300 rounded-xl"
          htmlFor="domain-input"
        >
          .ethoradev.com
        </label>
      </div>
      <div className="flex mbc-32">
        <div className="domain-input">
          <input
            placeholder="Your App Name"
            type="text"
            className="gen-input input-medium"
            name=""
            id="domain-input"
          />
          <label htmlFor="domain-input">.com</label>
        </div>
      </div>

      <p className="subtitle1">Google sign-in and Firebase analytics</p>
      <p className="body2">
        Firebase credentials are required to allow your users to sign on via
        Google Account. Also this allows you to track your app usage analytics
        in your Firebase console. These options will be disabled if credentials
        are not provided.
      </p>
      <p className="info mbc-16">
        <IconInfo />
        Copy paste the configuration from your Firebase Console
      </p>
      <Textarea
        className="firebase"
        value={firebaseWebConfigString}
        onChange={(e) => setFirebaseWebConfigString(e.target.value)}
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
    </div>
  );
}
