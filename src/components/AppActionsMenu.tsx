// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  httpArchiveApp,
  httpExportApp,
  httpHardDeleteApp,
  httpRestoreApp,
  saveBlobAs,
} from '../http';
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
  const status = app.status || 'active';

  const [busy, setBusy] = useState(false);
  const [confirmKind, setConfirmKind] = useState<'archive' | 'hard' | null>(null);

  const filenameStem = `ethora-app-${app._id || app.displayName}-${Date.now()}`;

  const handleExport = async () => {
    try {
      setBusy(true);
      const r = await httpExportApp(app._id, { format: 'zip' });
      saveBlobAs(r.data, `${filenameStem}.zip`);
      toast.success(`Exported ${app.displayName}`);
    } catch (e: any) {
      toast.error(`Export failed: ${e?.response?.data?.error || e?.message || 'unknown'}`);
    } finally {
      setBusy(false);
    }
  };

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

  if (status === 'deleting') {
    return <span className="text-gray-400 text-xs">purging...</span>;
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
          aria-label="More actions"
          title="More actions"
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
                Export
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
                  Restore
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
                  Archive
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
                Hard delete
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Menu>

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
    </>
  );
}
