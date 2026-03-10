
import { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import { actionUploadPushFirebaseServiceAccount } from '../../actions';
import { IconUpload } from '../../components/Icons/IconUpload';

interface Props {
  appId: string;
  primaryColor: string;
}

export function MobileApp({
  appId,
  primaryColor,
}: Props) {
  const pushServiceAccountRef = useRef<HTMLInputElement>(null);

  const onPushServiceAccountChanges = (file: File | null) => {
    if (!file) return;
    actionUploadPushFirebaseServiceAccount(appId, file)
      .then(() => {
        toast.success('Push service account uploaded');
      })
      .catch((e) => {
        const msg =
          e?.response?.data?.error ||
          e?.response?.data?.details ||
          e?.message ||
          'Failed to upload push service account';
        toast.error(String(msg));
      });
  };

  return (
    <div>
      <div className="font-semibold font-sans text-[16px] mb-2">Mobile App</div>
      <div className="font-semibold font-sans text-[14px] mb-2">
        Quick no code options
      </div>
      <div className="text-gray-500 font-sans text-[12px] mb-4">
      For quick no code integration, please check our <NavLink
          to={`/app/admin/apps/${appId}/settings?tab=Web+App`}
          className="text-blue-600 underline"
        >Web app</NavLink> and <NavLink
        to={`/app/admin/apps/${appId}/settings?tab=AI+Widget`}
        className="text-blue-600 underline"
      >AI Widget</NavLink> sections. Our web app is responsive and you can try using it on your mobile devices before you commit to building a native app.
      </div>
      <div className="max-w-[600px] w-full">
        <div className="font-bold font-sans text-[14px] mb-2">
          React Native
        </div>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>
            <a 
              href="https://github.com/dappros/ethora-chat-component-rn" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#4a9a9a] hover:underline text-sm"
            >
              https://github.com/dappros/ethora-chat-component-rn
            </a>
            <span className="font-sans text-sm leading-relaxed mb-4"> - Ethora Chat Component for React Native. Handy when you need to integrate chat or AI agent into your existing RN app.</span>
          </li>
          <li>
            <a 
              href="https://github.com/dappros/ethora-app-react-native" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#4a9a9a] hover:underline text-sm"
            >
              https://github.com/dappros/ethora-app-react-native
            </a>
            <span className="font-sans text-sm leading-relaxed mb-4"> - a full app template. Handy when you don't have an app and prefer a ready solution.</span>
          </li>
        </ul>

        <div className="font-bold font-sans text-[14px] mb-2">
          iOS Swift
        </div>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>
            <a 
              href="https://github.com/dappros/ethora-sdk-swift" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#4a9a9a] hover:underline text-sm"
            >
              https://github.com/dappros/ethora-sdk-swift
            </a>
            <span className="font-sans text-sm leading-relaxed mb-4"> - Swift SDK</span>
          </li>
        </ul>

        <div className="font-bold font-sans text-[14px] mb-2">
          Android Kotlin
        </div>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>
            <a 
              href="https://github.com/dappros/ethora-sdk-kotlin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#4a9a9a] hover:underline text-sm"
            >
              https://github.com/dappros/ethora-sdk-kotlin
            </a>
            <span className="font-sans text-sm leading-relaxed mb-4"> - Kotlin SDK</span>
          </li>
        </ul>
        <div className="font-bold font-sans text-[14px] mb-2 mt-2">
          Push Notifications
        </div>
        <p className="font-sans text-sm leading-relaxed mb-4">
        Follow <a href="https://forum.ethora.com/topic/75-setting-up-push-notifications-for-your-ethora-chats/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">this manual</a> to set up your Firebase account. Upload your <strong>service-account.json</strong> here to enable push notifications for offline chat messages.
        </p>
        <input
          type="file"
          ref={pushServiceAccountRef}
          accept=".json"
          className="hidden"
          onChange={(e) =>
            onPushServiceAccountChanges(e.target.files && e.target.files[0])
          }
        />
        <button
          className="w-full hover:bg-brand-hover rounded-xl border border-brand-500 text-brand-500 flex p-2 items-center justify-center mb-8"
          onClick={() => pushServiceAccountRef.current?.click()}
        >
          <IconUpload stroke={primaryColor}></IconUpload>
          <span className="ml-2">Upload</span>
        </button>
        
      </div>
    </div>
  );
}
