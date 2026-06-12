// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ConfirmModal } from '../../components/modal/ConfirmModal';
import {
  httpArchiveApp,
  httpHardDeleteApp,
  httpRestoreApp,
} from '../../http';
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

  const stats = app.stats || ({} as ModelApp['stats']);

  const handleArchive = async () => {
    try {
      setBusy(true);
      await httpArchiveApp(app._id);
      toast.success(`Archived ${app.displayName}`);
      onChanged?.();
    } catch (e: any) {
      toast.error(`Archive failed: ${e?.response?.data?.error || e?.message || 'unknown'}`);
    } finally {
      setBusy(false);
      setConfirmKind(null);
    }
  };

  const handleRestore = async () => {
    try {
      setBusy(true);
      await httpRestoreApp(app._id);
      toast.success(`Restored ${app.displayName}`);
      onChanged?.();
    } catch (e: any) {
      toast.error(`Restore failed: ${e?.response?.data?.error || e?.message || 'unknown'}`);
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
          ? `Hard delete queued for ${app.displayName} (job ${jobId}). The cascade runs in the background.`
          : `Hard delete started for ${app.displayName}.`,
      );
      onChanged?.();
    } catch (e: any) {
      toast.error(`Hard delete failed: ${e?.response?.data?.error || e?.message || 'unknown'}`);
    } finally {
      setBusy(false);
      setConfirmKind(null);
    }
  };

  return (
    <div ref={containerRef} className="overflow-y-auto pb-8">
      <div className="font-semibold font-sans text-[16px] mb-4">Delete or Archive</div>

      {/* Archive (reversible) */}
      <section className="mb-8 border border-gray-200 rounded-xl p-4">
        <div className="font-varela text-[16px] mb-2">
          {isArchived ? 'Restore (un-archive)' : 'Archive (soft delete)'}
        </div>
        <p className="font-sans text-sm text-gray-700 mb-4">
          {isArchived
            ? `"${app.displayName}" is currently archived. Restoring re-enables login for its users and brings the app back into the active list. All data is intact.`
            : `"${app.displayName}" will be hidden and its users will be blocked from logging in. All data (users, chats, files, sources, bot instances) is retained and the app can be restored later from the Archived list.`}
        </p>
        {isArchived ? (
          <button
            onClick={handleRestore}
            disabled={busy}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-green-700 text-green-700 hover:bg-green-50 disabled:opacity-50"
          >
            Restore {app.displayName}
          </button>
        ) : (
          <button
            onClick={() => setConfirmKind('archive')}
            disabled={busy}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover disabled:opacity-50"
          >
            Archive {app.displayName}
          </button>
        )}
      </section>

      {/* Hard delete (irreversible) */}
      <section className="border border-red-200 rounded-xl p-4 bg-red-50/30">
        <div className="font-varela text-[16px] mb-2 text-red-700">Hard delete (irreversible)</div>
        <p className="font-sans text-sm text-gray-700 mb-3">
          Permanently deletes the app and every entity tied to it. There is no
          restore after this point.
        </p>
        <div className="bg-white border border-red-200 rounded-lg px-4 py-3 mb-4 font-sans text-sm">
          The following will be permanently purged:
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>
              <span className="font-bold">{numberFormatter.format(stats.totalRegistered || 0)}</span> users
              {' '}(and their XMPP accounts, wallets, files)
            </li>
            <li>
              <span className="font-bold">{numberFormatter.format(stats.totalChats || 0)}</span> messages
              {' '}(across all chat rooms in this app)
            </li>
            <li>
              <span className="font-bold">{numberFormatter.format(stats.totalFiles || 0)}</span> files
              {' '}(Mongo metadata + MinIO blobs)
            </li>
            <li>Default chat rooms + MUC rooms on the XMPP server</li>
            <li>RAG sources (site crawls + uploaded documents)</li>
            <li>Bot instances and any in-app AI Widget configuration</li>
          </ul>
          <div className="mt-2 text-xs text-gray-600">
            Audit log rows are retained so the action remains traceable after the app is gone.
          </div>
        </div>
        <button
          onClick={() => setConfirmKind('hard')}
          disabled={busy}
          className="w-full sm:w-auto px-6 py-3 hover:bg-red-300 border bg-red-400 border-red-800 rounded-xl text-white font-varela disabled:opacity-50"
        >
          Hard delete {app.displayName}
        </button>
      </section>

      {confirmKind === 'archive' && (
        <ConfirmModal
          title="Archive this app?"
          message={`"${app.displayName}" will be hidden and its users won't be able to log in, but all data is retained. You can restore it later.`}
          confirmLabel="Archive"
          onConfirm={handleArchive}
          onCancel={() => setConfirmKind(null)}
          busy={busy}
        />
      )}
      {confirmKind === 'hard' && (
        <ConfirmModal
          title="Permanently delete this app?"
          message={
            <>
              <div>
                <span className="font-semibold">"{app.displayName}"</span> and all related data will
                be irreversibly purged.
              </div>
              <div className="mt-3 text-left max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                Will be purged:
                <ul className="mt-1 list-disc list-inside space-y-0.5">
                  <li><span className="font-bold">{numberFormatter.format(stats.totalRegistered || 0)}</span> users</li>
                  <li><span className="font-bold">{numberFormatter.format(stats.totalChats || 0)}</span> messages</li>
                  <li><span className="font-bold">{numberFormatter.format(stats.totalFiles || 0)}</span> files</li>
                </ul>
                <div className="mt-2 text-xs text-gray-600">
                  Chat rooms, sources, and bot instances tied to this app will also be removed.
                </div>
              </div>
              <div className="mt-3 text-red-700 font-semibold">This cannot be undone.</div>
            </>
          }
          confirmLabel="Yes, hard delete"
          danger
          onConfirm={handleHardDelete}
          onCancel={() => setConfirmKind(null)}
          busy={busy}
        />
      )}
    </div>
  );
};
