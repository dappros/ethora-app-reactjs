
import { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { actionPostFile } from '../../actions';
import { IconUpload } from '../../components/Icons/IconUpload';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  appId: string;
  setGoogleServicesJson: (s: string) => void;
  primaryColor: string;
}

export function MobileApp({
  appId,
  setGoogleServicesJson,
  primaryColor,
}: Props) {
  const { t } = useTranslation();
  const googleJsonRef = useRef<HTMLInputElement>(null);

  const onGoogleJsonRefChanges = (file: File | null) => {
    if (!file) {
      return;
    }

    actionPostFile(file).then((resp) => {
      setGoogleServicesJson(resp.data.results[0].location);
    });
  };

  return (
    <div>
      <div className="font-semibold font-sans text-[16px] mb-2">
        {t('appSettingsMobileApp.heading')}
      </div>
      <div className="font-semibold font-sans text-[14px] mb-2">
        {t('appSettingsMobileApp.quickNoCodeHeading')}
      </div>
      <div className="text-gray-500 font-sans text-[12px] mb-4">
      {t('appSettingsMobileApp.quickNoCodePrefix')} <NavLink
          to={`/app/admin/apps/${appId}/settings?tab=Web+App`}
          className="text-blue-600 underline"
        >{t('appSettingsMobileApp.webAppLinkText')}</NavLink> {t('appSettingsMobileApp.and')} <NavLink
        to={`/app/admin/apps/${appId}/settings?tab=AI+Widget`}
        className="text-blue-600 underline"
      >{t('appSettingsMobileApp.aiWidgetLinkText')}</NavLink> {t('appSettingsMobileApp.quickNoCodeSuffix')}
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
            <span className="font-sans text-sm leading-relaxed mb-4"> - {t('appSettingsMobileApp.reactNativeComponentDesc')}</span>
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
            <span className="font-sans text-sm leading-relaxed mb-4"> - {t('appSettingsMobileApp.reactNativeTemplateDesc')}</span>
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
            <span className="font-sans text-sm leading-relaxed mb-4"> - {t('appSettingsMobileApp.swiftSdkDesc')}</span>
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
            <span className="font-sans text-sm leading-relaxed mb-4"> - {t('appSettingsMobileApp.kotlinSdkDesc')}</span>
          </li>
        </ul>
        <div className="font-bold font-sans text-[14px] mb-2 mt-2">
          {t('appSettingsMobileApp.pushNotificationsHeading')}
        </div>
        <p className="font-sans text-sm leading-relaxed mb-4">
        {t('appSettingsMobileApp.followPrefix')} <a href="https://forum.ethora.com/topic/75-setting-up-push-notifications-for-your-ethora-chats/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{t('appSettingsMobileApp.thisManualLinkText')}</a> {t('appSettingsMobileApp.followMiddle')} <strong>service-account.json</strong>. {t('appSettingsMobileApp.followSuffix')}
        </p>
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
          <span className="ml-2">{t('appSettingsMobileApp.uploadButton')}</span>
        </button>

      </div>
    </div>
  );
}
