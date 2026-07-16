// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ConfirmModal } from '../../components/modal/ConfirmModal';
import {
  httpArchiveApp,
  httpGetAppChatRoomsCount,
  httpHardDeleteApp,
  httpRestoreApp,
} from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelApp } from '../../models';

interface Props {
  app: ModelApp;
  // Notification back to the parent settings page so it can reload the
  // updated app (status changes are otherwise invisible until refresh).
  onChanged?: () => void;
}

const numberFormatter = new Intl.NumberFormat('en-US');

// "Delete or Archive" panel inside AppSettings. Replaces the legacy "Delete"
// page that conflated soft + hard delete into a single red button. The two
// operations are now clearly separated (Archive is reversible, Hard delete
// is not) and a stats panel surfaces what would be purged so the operator
// sees the blast radius before confirming.
export const DeleteSetting = ({ app, onChanged }: Props) => {
  const { t } = useTranslation();
  const status = app.status || 'active';
  const isArchived = status === 'archived';

  const containerRef = useRef<HTMLDivElement>(null);

  // Pull the page to the top whenever this panel mounts. The old behavior
  // showed the bottom of the confirmation button on mobile because the page
  // scroll position carried over from wherever the user clicked the tab,
  // burying the explanation copy above it.
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
    // The TabPanels container itself is overflow-hidden on lg breakpoints,
    // so also reset the window scroll for mobile.
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const [confirmKind, setConfirmKind] = useState<'archive' | 'hard' | null>(null);
  const [busy, setBusy] = useState(false);
  // Chat rooms count appears in BOTH the inline blast-radius card and the
  // confirmation dialog, so we fetch it on mount rather than on confirm-open.
  // The list page only carries totalRegistered/totalChats/totalFiles in
  // app.stats; chat ROOMS is a separate query.
  const [chatRoomsCount, setChatRoomsCount] = useState<number | null>(null);
  useEffect(() => {
    httpGetAppChatRoomsCount(app._id)
      .then((r) => setChatRoomsCount(r?.data?.total ?? 0))
      .catch(() => setChatRoomsCount(null));
  }, [app._id]);

  const stats = app.stats || ({} as ModelApp['stats']);

  const handleArchive = async () => {
    try {
      setBusy(true);
      await httpArchiveApp(app._id);
      toast.success(t('appSettingsDelete.archivedToast').replace('{name}', app.displayName));
      onChanged?.();
    } catch (e: any) {
      toast.error(
        t('appSettingsDelete.archiveFailedToast').replace(
          '{error}',
          e?.response?.data?.error || e?.message || t('appSettingsDelete.unknownErrorFallback')
        )
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
      toast.success(t('appSettingsDelete.restoredToast').replace('{name}', app.displayName));
      onChanged?.();
    } catch (e: any) {
      toast.error(
        t('appSettingsDelete.restoreFailedToast').replace(
          '{error}',
          e?.response?.data?.error || e?.message || t('appSettingsDelete.unknownErrorFallback')
        )
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
          ? t('appSettingsDelete.hardDeleteQueuedToast')
              .replace('{name}', app.displayName)
              .replace('{jobId}', jobId)
          : t('appSettingsDelete.hardDeleteStartedToast').replace('{name}', app.displayName),
      );
      onChanged?.();
    } catch (e: any) {
      toast.error(
        t('appSettingsDelete.hardDeleteFailedToast').replace(
          '{error}',
          e?.response?.data?.error || e?.message || t('appSettingsDelete.unknownErrorFallback')
        )
      );
    } finally {
      setBusy(false);
      setConfirmKind(null);
    }
  };

  return (
    <div ref={containerRef} className="overflow-y-auto pb-8">
      <div className="font-semibold font-sans text-[16px] mb-4">{t('appSettingsDelete.heading')}</div>

      {/* Archive (reversible) */}
      <section className="mb-8 border border-gray-200 rounded-xl p-4">
        <div className="font-varela text-[16px] mb-2">
          {isArchived ? t('appSettingsDelete.restoreHeading') : t('appSettingsDelete.archiveHeading')}
        </div>
        <p className="font-sans text-sm text-gray-700 mb-4">
          {isArchived ? (
            <>"{app.displayName}" {t('appSettingsDelete.archivedDescriptionSuffix')}</>
          ) : (
            <>"{app.displayName}" {t('appSettingsDelete.notArchivedDescriptionSuffix')}</>
          )}
        </p>
        {isArchived ? (
          <button
            onClick={handleRestore}
            disabled={busy}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-green-700 text-green-700 hover:bg-green-50 disabled:opacity-50"
          >
            {t('appSettingsDelete.restoreWord')} {app.displayName}
          </button>
        ) : (
          <button
            onClick={() => setConfirmKind('archive')}
            disabled={busy}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover disabled:opacity-50"
          >
            {t('appSettingsDelete.archiveWord')} {app.displayName}
          </button>
        )}
      </section>

      {/* Hard delete (irreversible) */}
      <section className="border border-red-200 rounded-xl p-4 bg-red-50/30">
        <div className="font-varela text-[16px] mb-2 text-red-700">{t('appSettingsDelete.hardDeleteHeading')}</div>
        <p className="font-sans text-sm text-gray-700 mb-3">
          {t('appSettingsDelete.hardDeleteDescription')}
        </p>
        <div className="bg-white border border-red-200 rounded-lg px-4 py-3 mb-4 font-sans text-sm">
          {t('appSettingsDelete.purgeListIntro')}
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li><span className="font-bold">{numberFormatter.format(stats.totalRegistered || 0)}</span> {t('appSettingsDelete.usersSuffix')}</li>
            <li>
              <span className="font-bold">
                {chatRoomsCount === null ? '-' : numberFormatter.format(chatRoomsCount)}
              </span> {t('appSettingsDelete.chatRoomsSuffix')}
            </li>
            <li><span className="font-bold">{numberFormatter.format(stats.totalChats || 0)}</span> {t('appSettingsDelete.chatMessagesSuffix')}</li>
            <li><span className="font-bold">{numberFormatter.format(stats.totalFiles || 0)}</span> {t('appSettingsDelete.filesSuffix')}</li>
            <li>{t('appSettingsDelete.appearanceConfigItem')}</li>
            <li>{t('appSettingsDelete.defaultChatRoomsSettingsItem')}</li>
            <li>{t('appSettingsDelete.aiDataItem')}</li>
            <li>{t('appSettingsDelete.botInstancesItem')}</li>
          </ul>
          <div className="mt-2 text-xs text-gray-600">
            {t('appSettingsDelete.auditLogNote')}
          </div>
        </div>
        <button
          onClick={() => setConfirmKind('hard')}
          disabled={busy}
          className="w-full sm:w-auto px-6 py-3 hover:bg-red-300 border bg-red-400 border-red-800 rounded-xl text-white font-varela disabled:opacity-50"
        >
          {t('appSettingsDelete.hardDeleteWord')} {app.displayName}
        </button>
      </section>

      {confirmKind === 'archive' && (
        <ConfirmModal
          title={t('appSettingsDelete.archiveModalTitle')}
          message={
            <>"{app.displayName}" {t('appSettingsDelete.archiveModalMessageSuffix')}</>
          }
          confirmLabel={t('appSettingsDelete.archiveWord')}
          onConfirm={handleArchive}
          onCancel={() => setConfirmKind(null)}
          busy={busy}
        />
      )}
      {confirmKind === 'hard' && (
        <ConfirmModal
          title={t('appSettingsDelete.hardDeleteModalTitle')}
          message={
            <>
              <div>
                <span className="font-semibold">"{app.displayName}"</span>{' '}
                {t('appSettingsDelete.hardDeleteModalIntroSuffix')}
              </div>
              <div className="mt-3 text-left max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {t('appSettingsDelete.purgeListIntro')}
                <ul className="mt-1 list-disc list-inside space-y-0.5">
                  <li><span className="font-bold">{numberFormatter.format(stats.totalRegistered || 0)}</span> {t('appSettingsDelete.usersSuffix')}</li>
                  <li>
                    <span className="font-bold">
                      {chatRoomsCount === null ? '-' : numberFormatter.format(chatRoomsCount)}
                    </span> {t('appSettingsDelete.chatRoomsSuffix')}
                  </li>
                  <li><span className="font-bold">{numberFormatter.format(stats.totalChats || 0)}</span> {t('appSettingsDelete.chatMessagesSuffix')}</li>
                  <li><span className="font-bold">{numberFormatter.format(stats.totalFiles || 0)}</span> {t('appSettingsDelete.filesSuffix')}</li>
                  <li>{t('appSettingsDelete.appearanceConfigItem')}</li>
                  <li>{t('appSettingsDelete.defaultChatRoomsSettingsItem')}</li>
                  <li>{t('appSettingsDelete.aiDataItem')}</li>
                  <li>{t('appSettingsDelete.botInstancesItem')}</li>
                </ul>
              </div>
              <div className="mt-3 text-red-700 font-semibold">{t('appSettingsDelete.cannotBeUndone')}</div>
            </>
          }
          confirmLabel={t('appSettingsDelete.hardDeleteConfirmLabel')}
          danger
          onConfirm={handleHardDelete}
          onCancel={() => setConfirmKind(null)}
          busy={busy}
        />
      )}
    </div>
  );
};
