
import { useEffect, useRef, useState } from 'react';
import { Field, Label, Switch } from '@headlessui/react';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  actionDeleteApnsKey,
  actionDeleteFirebaseServiceAccount,
  actionUploadApnsKey,
  actionUploadFirebaseServiceAccount,
} from '../../actions';
import {
  ApnsEnvironment,
  httpGetPushPlatform,
  httpSetPushPlatform,
  PushPlatformState,
} from '../../http';
import { IconDelete } from '../../components/Icons/IconDelete';
import { IconUpload } from '../../components/Icons/IconUpload';
import { ConfirmModal } from '../../components/modal/ConfirmModal';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  appId: string;
  firebaseServiceAccountUploaded: boolean;
  apnsKeyUploaded: boolean;
  /** The app's own bundle id, used to prefill the APNs form. */
  bundleId?: string;
  primaryColor: string;
}

const APPLE_ID_LENGTH = 10;

/** Backend answers validation problems with 422 + a human-readable `error`; show it verbatim. */
const errorMessage = (error: unknown, fallback: string): string => {
  const response = (error as { response?: { status?: number; data?: { error?: string } } })
    ?.response;
  return response?.status === 422 && response.data?.error
    ? String(response.data.error)
    : fallback;
};

export function MobileApp({
  appId,
  firebaseServiceAccountUploaded,
  apnsKeyUploaded,
  bundleId,
  primaryColor,
}: Props) {
  const { t } = useTranslation();
  const googleJsonRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [platform, setPlatform] = useState<PushPlatformState | null>(null);
  const [platformBusy, setPlatformBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    httpGetPushPlatform(appId)
      .then(({ data }) => {
        if (!cancelled) setPlatform(data);
      })
      .catch((error) => {
        if (error?.response?.status !== 404) {
          console.error('Error loading platform push state:', error);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [appId]);

  const apnsFileRef = useRef<HTMLInputElement>(null);
  const [apnsFile, setApnsFile] = useState<File | null>(null);
  const [apnsKeyId, setApnsKeyId] = useState('');
  const [apnsTeamId, setApnsTeamId] = useState('');
  const [apnsEnvironment, setApnsEnvironment] = useState<ApnsEnvironment>('production');
  const [apnsBundleId, setApnsBundleId] = useState(bundleId ?? '');
  const [apnsBusy, setApnsBusy] = useState(false);
  const [confirmDeleteApns, setConfirmDeleteApns] = useState(false);

  const apnsFormValid =
    !!apnsFile &&
    apnsKeyId.trim().length === APPLE_ID_LENGTH &&
    apnsTeamId.trim().length === APPLE_ID_LENGTH &&
    apnsBundleId.trim().length > 0;

  const onUploadApnsKey = async () => {
    if (!apnsFormValid || apnsBusy || !apnsFile) return;
    setApnsBusy(true);
    try {
      await actionUploadApnsKey(appId, {
        file: apnsFile,
        keyId: apnsKeyId.trim(),
        teamId: apnsTeamId.trim(),
        environment: apnsEnvironment,
        bundleId: apnsBundleId.trim(),
      });
      toast.success(t('appSettingsMobileApp.apns.toast.uploadSuccess'));
      setApnsFile(null);
      if (apnsFileRef.current) apnsFileRef.current.value = '';
    } catch (error) {
      console.error('Error uploading APNs key:', error);
      toast.error(errorMessage(error, t('appSettingsMobileApp.apns.toast.uploadFailed')));
    } finally {
      setApnsBusy(false);
    }
  };

  const onDeleteApnsKey = async () => {
    setApnsBusy(true);
    try {
      await actionDeleteApnsKey(appId);
      toast.success(t('appSettingsMobileApp.apns.toast.deleteSuccess'));
      setConfirmDeleteApns(false);
    } catch (error) {
      console.error('Error deleting APNs key:', error);
      toast.error(errorMessage(error, t('appSettingsMobileApp.apns.toast.deleteFailed')));
    } finally {
      setApnsBusy(false);
    }
  };

  const onPlatformToggle = async (enabled: boolean) => {
    if (platformBusy) return;
    setPlatformBusy(true);
    try {
      const { data } = await httpSetPushPlatform(appId, enabled);
      setPlatform((prev) => ({ ...(prev ?? { todayCount: 0, quota: 0 }), ...data, enabled }));
      toast.success(
        enabled
          ? t('appSettingsMobileApp.platform.toast.enabled')
          : t('appSettingsMobileApp.platform.toast.disabled')
      );
    } catch (error) {
      console.error('Error updating platform push state:', error);
      toast.error(errorMessage(error, t('appSettingsMobileApp.platform.toast.failed')));
    } finally {
      setPlatformBusy(false);
    }
  };

  const onGoogleJsonRefChanges = async (file: File | null) => {
    if (!file || busy) {
      return;
    }

    setBusy(true);

    try {
      await actionUploadFirebaseServiceAccount(appId, file);
      toast.success(t('appSettingsMobileApp.toast.uploadSuccess'));
    } catch (error) {
      console.error('Error uploading Firebase service account:', error);
      toast.error(t('appSettingsMobileApp.toast.uploadFailed'));
    } finally {
      setBusy(false);
      if (googleJsonRef.current) {
        googleJsonRef.current.value = '';
      }
    }
  };

  const onDeleteServiceAccount = async () => {
    setBusy(true);

    try {
      await actionDeleteFirebaseServiceAccount(appId);
      toast.success(t('appSettingsMobileApp.toast.deleteSuccess'));
      setConfirmDelete(false);
    } catch (error) {
      console.error('Error deleting Firebase service account:', error);
      toast.error(t('appSettingsMobileApp.toast.deleteFailed'));
    } finally {
      setBusy(false);
    }
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

        {platform && (
          <div className="rounded-xl border border-gray-200 p-4 mb-6">
            <Field className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-semibold font-sans text-sm block">
                  {t('appSettingsMobileApp.platform.label')}
                </Label>
                <p className="font-sans text-xs text-gray-500 mt-1">
                  {t('appSettingsMobileApp.platform.hint')}
                </p>
              </div>
              <Switch
                checked={platform.enabled}
                disabled={platformBusy}
                onChange={onPlatformToggle}
                className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full bg-gray-300 transition data-[checked]:bg-brand-500 disabled:opacity-50"
              >
                <span className="pointer-events-none inline-block size-5 translate-x-0.5 translate-y-0.5 rounded-full bg-white shadow transition group-data-[checked]:translate-x-5" />
              </Switch>
            </Field>
            {platform.enabled && (
              <p className="font-sans text-xs text-gray-500 mt-3">
                {t('appSettingsMobileApp.platform.usage')
                  .replace('{used}', String(platform.todayCount ?? 0))
                  .replace('{quota}', String(platform.quota ?? 0))}
              </p>
            )}
          </div>
        )}
        <div className="font-semibold font-sans text-sm mb-1">
          {t('appSettingsMobileApp.apns.heading')}
        </div>
        <p className="font-sans text-xs text-gray-500 mb-3">
          {t('appSettingsMobileApp.apns.description')}
        </p>
        {apnsKeyUploaded ? (
          <button
            className="w-full hover:bg-red-50 rounded-xl border border-red-500 text-red-500 flex p-2 items-center justify-center mb-8 disabled:opacity-50"
            disabled={apnsBusy}
            onClick={() => setConfirmDeleteApns(true)}
          >
            <IconDelete />
            <span className="ml-2">{t('appSettingsMobileApp.apns.deleteButton')}</span>
          </button>
        ) : (
          <div className="rounded-xl border border-gray-200 p-4 mb-8 space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  {t('appSettingsMobileApp.apns.keyIdLabel')}
                </label>
                <input
                  type="text"
                  value={apnsKeyId}
                  onChange={(e) => setApnsKeyId(e.target.value.toUpperCase())}
                  placeholder="ABCDE12345"
                  maxLength={APPLE_ID_LENGTH}
                  className="rounded-2xl bg-gray-100 py-3 px-6 w-full outline-none font-sans text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  {t('appSettingsMobileApp.apns.teamIdLabel')}
                </label>
                <input
                  type="text"
                  value={apnsTeamId}
                  onChange={(e) => setApnsTeamId(e.target.value.toUpperCase())}
                  placeholder="1A2BC3D4E5"
                  maxLength={APPLE_ID_LENGTH}
                  className="rounded-2xl bg-gray-100 py-3 px-6 w-full outline-none font-sans text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  {t('appSettingsMobileApp.apns.bundleIdLabel')}
                </label>
                <input
                  type="text"
                  value={apnsBundleId}
                  onChange={(e) => setApnsBundleId(e.target.value)}
                  placeholder="com.example.app"
                  className="rounded-2xl bg-gray-100 py-3 px-6 w-full outline-none font-sans text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  {t('appSettingsMobileApp.apns.environmentLabel')}
                </label>
                <select
                  value={apnsEnvironment}
                  onChange={(e) => setApnsEnvironment(e.target.value as ApnsEnvironment)}
                  className="rounded-2xl bg-gray-100 py-3 px-6 w-full outline-none font-sans text-sm"
                >
                  <option value="production">production</option>
                  <option value="sandbox">sandbox</option>
                </select>
              </div>
            </div>
            <input
              type="file"
              ref={apnsFileRef}
              accept=".p8"
              className="hidden"
              onChange={(e) => setApnsFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex flex-col md:flex-row gap-3">
              <button
                className="flex-1 hover:bg-gray-50 rounded-xl border border-gray-300 text-gray-700 flex p-2 items-center justify-center disabled:opacity-50"
                disabled={apnsBusy}
                onClick={() => apnsFileRef.current?.click()}
              >
                <IconUpload stroke="#374151" />
                <span className="ml-2 truncate">
                  {apnsFile ? apnsFile.name : t('appSettingsMobileApp.apns.chooseFile')}
                </span>
              </button>
              <button
                className="flex-1 hover:bg-brand-hover rounded-xl border border-brand-500 text-brand-500 flex p-2 items-center justify-center disabled:opacity-50"
                disabled={apnsBusy || !apnsFormValid}
                onClick={onUploadApnsKey}
              >
                <IconUpload stroke={primaryColor} />
                <span className="ml-2">{t('appSettingsMobileApp.apns.uploadButton')}</span>
              </button>
            </div>
          </div>
        )}

        <div className="font-semibold font-sans text-sm mb-1">
          {t('appSettingsMobileApp.firebase.heading')}
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
        {firebaseServiceAccountUploaded ? (
          <button
            className="w-full hover:bg-red-50 rounded-xl border border-red-500 text-red-500 flex p-2 items-center justify-center mb-8 disabled:opacity-50"
            disabled={busy}
            onClick={() => setConfirmDelete(true)}
          >
            <IconDelete />
            <span className="ml-2">
              {t('appSettingsMobileApp.deleteButton')}
            </span>
          </button>
        ) : (
          <button
            className="w-full hover:bg-brand-hover rounded-xl border border-brand-500 text-brand-500 flex p-2 items-center justify-center mb-8 disabled:opacity-50"
            disabled={busy}
            onClick={() => googleJsonRef.current?.click()}
          >
            <IconUpload stroke={primaryColor}></IconUpload>
            <span className="ml-2">
              {t('appSettingsMobileApp.uploadButton')}
            </span>
          </button>
        )}

      </div>

      {confirmDeleteApns && (
        <ConfirmModal
          title={t('appSettingsMobileApp.apns.deleteModal.title')}
          message={t('appSettingsMobileApp.apns.deleteModal.message')}
          confirmLabel={t('appSettingsMobileApp.apns.deleteModal.confirmLabel')}
          danger
          busy={apnsBusy}
          onConfirm={onDeleteApnsKey}
          onCancel={() => setConfirmDeleteApns(false)}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title={t('appSettingsMobileApp.deleteModal.title')}
          message={t('appSettingsMobileApp.deleteModal.message')}
          confirmLabel={t('appSettingsMobileApp.deleteModal.confirmLabel')}
          danger
          busy={busy}
          onConfirm={onDeleteServiceAccount}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
