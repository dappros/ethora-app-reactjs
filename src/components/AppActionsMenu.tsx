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

// Per-app "..." action menu. Different items show depending on app.status:
//   active   -> Export JSON / Export ZIP / Archive / Hard delete
//   archived -> Export JSON / Export ZIP / Restore / Hard delete
//   deleting -> (no actions; purge in flight)
//   deleted  -> (entity is gone; menu should never render)
export function AppActionsMenu({ app, onChanged }: Props) {
  const status = app.status || 'active';

  const [busy, setBusy] = useState(false);
  const [confirmKind, setConfirmKind] = useState<'archive' | 'hard' | null>(null);

  const filenameStem = `ethora-app-${app._id || app.displayName}-${Date.now()}`;

  const handleExport = async (format: 'json' | 'zip') => {
    try {
      setBusy(true);
      const r = await httpExportApp(app._id, { format });
      const ext = format === 'zip' ? 'zip' : 'json';
      saveBlobAs(r.data, `${filenameStem}.${ext}`);
      toast.success(`Exported ${app.displayName} (${format.toUpperCase()})`);
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
                onClick={() => handleExport('json')}
                className={`${focus ? 'bg-gray-100' : ''} w-full text-left px-3 py-2 rounded-lg text-sm`}
              >
                Export as JSON
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <button
                onClick={() => handleExport('zip')}
                className={`${focus ? 'bg-gray-100' : ''} w-full text-left px-3 py-2 rounded-lg text-sm`}
              >
                Export as ZIP
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
                  Archive (soft delete)
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
                Hard delete (cascade)...
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
          message={`"${app.displayName}" and ALL related data (users, chats, files, sources, bot instances) will be irreversibly purged. This cannot be undone.`}
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
