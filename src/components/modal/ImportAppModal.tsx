// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved

import { Dialog, DialogPanel } from '@headlessui/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { IconClose } from '../Icons/IconClose';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  onClose: () => void;
  onImported: (newAppId: string) => void;
  // Injected so the same dialog can be reused for Agent import by swapping this fn.
  doImport: (input: File | object, domainNameOverride?: string) => Promise<{ data: any }>;
  // Optional title override - defaults to "Import App".
  title?: string;
  // Optional helper text override.
  helperText?: string;
  // Show the domainNameOverride field (Apps yes, Agents no).
  showDomainOverride?: boolean;
}

// Import an App (or Agent) from a JSON or zip bundle. Accepts:
//   - a file picked via <input type="file">
//   - or pasted JSON (for advanced users / scripted flows)
// JSON path lets ops paste a bundle out of a clipboard without dragging files,
// useful when the bundle came from a customer over email/chat.
export function ImportAppModal({
  onClose,
  onImported,
  doImport,
  title,
  helperText,
  showDomainOverride = true,
}: Props) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('importAppModal.defaultTitle');
  const resolvedHelperText = helperText ?? t('importAppModal.defaultHelperText');

  const [file, setFile] = useState<File | null>(null);
  const [pastedJson, setPastedJson] = useState('');
  const [domainNameOverride, setDomainNameOverride] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    try {
      setBusy(true);
      let r;
      if (file) {
        r = await doImport(file, domainNameOverride || undefined);
      } else {
        const trimmed = pastedJson.trim();
        if (!trimmed) {
          toast.error(t('importAppModal.pickFileOrPaste'));
          return;
        }
        let bundle: object;
        try {
          bundle = JSON.parse(trimmed);
        } catch (e: any) {
          toast.error(
            `${t('importAppModal.pastedJsonInvalid')}${e?.message || t('importAppModal.parseFailed')}`
          );
          return;
        }
        r = await doImport(bundle, domainNameOverride || undefined);
      }
      setResult(r.data);
      toast.success(t('importAppModal.importedSuccessfully'));
      const summary = r?.data?.summary || {};
      if (summary.newAppId) onImported(summary.newAppId);
      else if (r?.data?.agent?.id) onImported(r.data.agent.id);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || t('importAppModal.unknownError');
      toast.error(`${t('importAppModal.importFailed')}${msg}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open
      onClose={busy ? () => {} : onClose}
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 transition duration-300"
    >
      <DialogPanel className="p-4 sm:py-8 sm:px-[24px] bg-white rounded-3xl w-full max-w-[720px] m-8 relative max-h-[90vh] overflow-y-auto">
        {!busy && (
          <button
            className="absolute top-[15px] right-[15px]"
            onClick={onClose}
            aria-label={t('importAppModal.close')}
          >
            <IconClose />
          </button>
        )}
        <div className="font-varela text-[20px] mt-4 mb-2">{resolvedTitle}</div>
        <div className="font-sans text-sm text-gray-600 mb-6">{resolvedHelperText}</div>

        <div className="grid gap-4">
          <div>
            <label className="block font-varela text-sm text-gray-700 mb-1">
              {t('importAppModal.bundleFileLabel')}
            </label>
            <input
              type="file"
              accept=".json,application/json,.zip,application/zip"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={busy}
              className="block w-full text-sm border border-gray-200 rounded-lg p-2"
            />
            {file && (
              <div className="text-xs text-gray-500 mt-1">
                {t('importAppModal.selectedPrefix')} {file.name} ({Math.round(file.size / 1024)}{' '}
                {t('importAppModal.kb')})
              </div>
            )}
          </div>

          <div className="text-center text-xs text-gray-400">
            {t('importAppModal.orPasteBelow')}
          </div>

          <div>
            <label className="block font-varela text-sm text-gray-700 mb-1">
              {t('importAppModal.bundleJsonLabel')}
            </label>
            <textarea
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
              disabled={busy || !!file}
              placeholder='{ "schemaVersion": "ethora.app.bundle.v1", ... }'
              rows={6}
              className="block w-full text-xs font-mono border border-gray-200 rounded-lg p-2 disabled:bg-gray-50"
            />
          </div>

          {showDomainOverride && (
            <div>
              <label className="block font-varela text-sm text-gray-700 mb-1">
                {t('importAppModal.domainNameLabel')}
              </label>
              <input
                type="text"
                value={domainNameOverride}
                onChange={(e) => setDomainNameOverride(e.target.value)}
                disabled={busy}
                placeholder={t('importAppModal.domainNamePlaceholder')}
                className="block w-full text-sm border border-gray-200 rounded-lg p-2"
              />
            </div>
          )}

          {result && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs">
              <div className="font-varela text-sm mb-1">{t('importAppModal.importResultLabel')}</div>
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <button
            disabled={busy}
            className="w-full py-3 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover disabled:opacity-50"
            onClick={onClose}
          >
            {t('importAppModal.cancel')}
          </button>
          <button
            disabled={busy || (!file && !pastedJson.trim())}
            onClick={handleSubmit}
            className="w-full py-3 hover:bg-brand-darker p-2 border bg-brand-500 border-brand-darker rounded-xl text-white disabled:opacity-50"
          >
            {busy ? t('importAppModal.importing') : t('importAppModal.import')}
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
