import { useRef } from 'react';
import { actionPostFile } from '../../actions';
import { IconDownload } from '../../components/Icons/IconDownload';
import { IconUpload } from '../../components/Icons/IconUpload';
// import './MobileApp.scss';

interface Props {
  bundleId: string;
  setBundleId: (s: string) => void;
  setGoogleServicesJson: (s: string) => void;
  setGoogleServiceInfoPlist: (s: string) => void;
  primaryColor: string;
}

export function MobileApp({
  bundleId,
  setBundleId,
  setGoogleServicesJson,
  setGoogleServiceInfoPlist,
  primaryColor,
}: Props) {
  const googleJsonRef = useRef<HTMLInputElement>(null);
  const plistFileRef = useRef<HTMLInputElement>(null);

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
    <div>
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
        <button className="w-full rounded-xl border border-brand-500 text-brand-500 flex p-2 items-center justify-center mb-8">
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
          className="w-full rounded-xl border border-brand-500 text-brand-500 flex p-2 items-center justify-center mb-8"
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
          className="w-full rounded-xl border border-brand-500 text-brand-500 flex p-2 items-center justify-center mb-4"
        >
          <IconUpload stroke={primaryColor}></IconUpload>
          <span className="ml-2">Upload</span>
        </button>
        <div className="font-semibold text-sm mb-2">
          Push Notifications Certificate (Apple)
        </div>
        <button className="w-full rounded-xl border border-brand-500 text-brand-500 flex p-2 items-center justify-center mb-4">
          <IconUpload stroke={primaryColor}></IconUpload>
          <span className="ml-2">Upload</span>
        </button>
      </div>
    </div>
  );
}
