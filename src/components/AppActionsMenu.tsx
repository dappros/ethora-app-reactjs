// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  httpArchiveApp,
  httpExportApp,
  httpGetAppChatRoomsCount,
  httpHardDeleteApp,
  httpRestoreApp,
  saveBlobAs,
} from '../http';
import { useTranslation } from '../i18n/useTranslation';
import { ModelApp } from '../models';
import { ConfirmModal } from './modal/ConfirmModal';

interface Props {
  app: ModelApp;
  onChanged?: () => void; // callback so the parent list refreshes
}

const numberFormatter = new Intl.NumberFormat('en-US');

// Per-app "..." action menu. Different items show depending on app.status:
//   active   -> Export / Archive / Hard delete
//   archived -> Export / Restore / Hard delete
//   deleting -> (no actions; purge in flight)
//   deleted  -> (entity is gone; menu should never render)
//
// Export is one item and always produces a zipped JSON bundle; two separate
// items (JSON vs ZIP) felt like noise. The bundle inside the zip is the same
// JSON you'd get from the JSON path - the zip is just better for storing and
// passing around (smaller, single artifact). Operators who want the raw JSON
// can unzip it client-side.
export function AppActionsMenu({ app, onChanged }: Props) {
  const { t } = useTranslation();
  const status = app.status || 'active';

  const [busy, setBusy] = useState(false);
  const [confirmKind, setConfirmKind] = useState<'archive' | 'hard' | null>(null);
  // Chat rooms count for the hard-delete confirmation. Lazy-loaded when the
  // user opens the dialog so the listing page itself doesn't pay an extra
  // round-trip per app. `null` = unknown / still loading; the modal renders
  // a dash in that case rather than blocking the user.
  const [chatRoomsCount, setChatRoomsCount] = useState<number | null>(null);

  useEffect(() => {
    if (confirmKind !== 'hard') return;
    setChatRoomsCount(null);
    httpGetAppChatRoomsCount(app._id)
      .then((r) => setChatRoomsCount(r?.data?.total ?? 0))
      .catch(() => setChatRoomsCount(null));
  }, [confirmKind, app._id]);

  const filenameStem = `ethora-app-${app._id || app.displayName}-${Date.now()}`;

  const errorMessage = (e: any) =>
    e?.response?.data?.error || e?.message || t('appActionsMenu.unknownError');

  const handleExport = async () => {
    try {
      setBusy(true);
      const r = await httpExportApp(app._id, { format: 'zip' });
      saveBlobAs(r.data, `${filenameStem}.zip`);
      toast.success(t('appActionsMenu.toast.exported').replace('{name}', app.displayName));
    } catch (e: any) {
      toast.error(
        t('appActionsMenu.toast.exportFailed').replace('{error}', errorMessage(e))
      );
    } finally {
      setBusy(false);
    }
  };

  const handleArchive = async () => {
    try {
      setBusy(true);
      await httpArchiveApp(app._id);
      toast.success(t('appActionsMenu.toast.archived').replace('{name}', app.displayName));
      onChanged?.();
    } catch (e: any) {
      toast.error(
        t('appActionsMenu.toast.archiveFailed').replace('{error}', errorMessage(e))
      );
    } finally {
      setBusy(false);
      setConfirmKind(null);
    }
  };

  const handleRestore = async () => {
    try {
      setBusy(true);
      await httpRestoreApp(app._id);
      toast.success(t('appActionsMenu.toast.restored').replace('{name}', app.displayName));
      onChanged?.();
    } catch (e: any) {
      toast.error(
        t('appActionsMenu.toast.restoreFailed').replace('{error}', errorMessage(e))
      );
    } finally {
      setBusy(false);
    }
  };

  const handleHardDelete = async () => {
    try {
      setBusy(true);
      const r = await httpHardDeleteApp(app._id);
      const jobId = r?.data?.jobId;
      toast.info(
        jobId
          ? t('appActionsMenu.toast.hardDeleteQueued')
              .replace('{name}', app.displayName)
              .replace('{jobId}', jobId)
          : t('appActionsMenu.toast.hardDeleteStarted').replace('{name}', app.displayName)
      );
      onChanged?.();
    } catch (e: any) {
      toast.error(
        t('appActionsMenu.toast.hardDeleteFailed').replace('{error}', errorMessage(e))
      );
    } finally {
      setBusy(false);
      setConfirmKind(null);
    }
  };

  if (status === 'deleting') {
    return <span className="text-gray-400 text-xs">{t('appActionsMenu.purging')}</span>;
  }
  if (status === 'deleted') {
    return null;
  }

  const stats = app.stats || ({} as ModelApp['stats']);

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton
          disabled={busy}
          className="w-[40px] h-[40px] rounded-xl flex items-center justify-center hover:bg-brand-hover disabled:opacity-50"
          aria-label={t('appActionsMenu.moreActions')}
          title={t('appActionsMenu.moreActions')}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="4" cy="10" r="1.6" fill="currentColor" />
            <circle cx="10" cy="10" r="1.6" fill="currentColor" />
            <circle cx="16" cy="10" r="1.6" fill="currentColor" />
          </svg>
        </MenuButton>
        <MenuItems
          anchor="bottom end"
          className="z-50 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none p-1"
        >
          <MenuItem>
            {({ focus }) => (
              <button
                onClick={handleExport}
                className={`${focus ? 'bg-gray-100' : ''} w-full text-left px-3 py-2 rounded-lg text-sm`}
              >
                {t('appActionsMenu.export')}
              </button>
            )}
          </MenuItem>
          <div className="border-t border-gray-100 my-1" />
          {status === 'archived' ? (
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={handleRestore}
                  className={`${focus ? 'bg-gray-100' : ''} w-full text-left px-3 py-2 rounded-lg text-sm text-green-700`}
                >
                  {t('appActionsMenu.restore')}
                </button>
              )}
            </MenuItem>
          ) : (
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={() => setConfirmKind('archive')}
                  className={`${focus ? 'bg-gray-100' : ''} w-full text-left px-3 py-2 rounded-lg text-sm`}
                >
                  {t('appActionsMenu.archive')}
                </button>
              )}
            </MenuItem>
          )}
          <MenuItem>
            {({ focus }) => (
              <button
                onClick={() => setConfirmKind('hard')}
                className={`${focus ? 'bg-gray-100' : ''} w-full text-left px-3 py-2 rounded-lg text-sm text-red-600`}
              >
                {t('appActionsMenu.hardDelete')}
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Menu>

      {confirmKind === 'archive' && (
        <ConfirmModal
          title={t('appActionsMenu.confirmArchive.title')}
          message={t('appActionsMenu.confirmArchive.message').replace(
            '{name}',
            app.displayName
          )}
          confirmLabel={t('appActionsMenu.confirmArchive.confirmLabel')}
          onConfirm={handleArchive}
          onCancel={() => setConfirmKind(null)}
          busy={busy}
        />
      )}
      {confirmKind === 'hard' && (
        <ConfirmModal
          title={t('appActionsMenu.confirmHardDelete.title')}
          message={
            <>
              <div>
                <span className="font-semibold">"{app.displayName}"</span>{' '}
                {t('appActionsMenu.confirmHardDelete.intro')}
              </div>
              <div className="mt-3 text-left max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {t('appActionsMenu.confirmHardDelete.purgeListTitle')}
                <ul className="mt-1 list-disc list-inside space-y-0.5">
                  <li>
                    <span className="font-bold">{numberFormatter.format(stats.totalRegistered || 0)}</span>{' '}
                    {t('appActionsMenu.confirmHardDelete.users')}
                  </li>
                  <li>
                    <span className="font-bold">
                      {chatRoomsCount === null ? '-' : numberFormatter.format(chatRoomsCount)}
                    </span>{' '}
                    {t('appActionsMenu.confirmHardDelete.chatRooms')}
                  </li>
                  <li>
                    <span className="font-bold">{numberFormatter.format(stats.totalChats || 0)}</span>{' '}
                    {t('appActionsMenu.confirmHardDelete.chatMessages')}
                  </li>
                  <li>
                    <span className="font-bold">{numberFormatter.format(stats.totalFiles || 0)}</span>{' '}
                    {t('appActionsMenu.confirmHardDelete.files')}
                  </li>
                  <li>{t('appActionsMenu.confirmHardDelete.appearanceConfig')}</li>
                  <li>{t('appActionsMenu.confirmHardDelete.defaultChatRoomsSettings')}</li>
                  <li>{t('appActionsMenu.confirmHardDelete.aiData')}</li>
                  <li>{t('appActionsMenu.confirmHardDelete.botInstances')}</li>
                </ul>
              </div>
              <div className="mt-3 text-red-700 font-semibold">
                {t('appActionsMenu.confirmHardDelete.cannotBeUndone')}
              </div>
            </>
          }
          confirmLabel={t('appActionsMenu.confirmHardDelete.confirmLabel')}
          danger
          onConfirm={handleHardDelete}
          onCancel={() => setConfirmKind(null)}
          busy={busy}
        />
      )}
    </>
  );
}
