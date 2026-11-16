import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelApp } from '../../models';
import {
  createWebsiteAssistant,
  WebsiteAssistantError,
  WebsiteAssistantProgress,
  WebsiteAssistantStage,
} from '../../utils/createWebsiteAssistant';
import { normaliseWebsite } from '../../utils/onboardingIntent';

// The one-step website assistant for an App that has none yet (the start
// screen has the same form as a page). Website first; documents are the
// alternative for owners without one.
export function CreateWidgetModal({ onClose, existingApp }: { onClose: () => void; existingApp: ModelApp }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [website, setWebsite] = useState('');
  const [useDocs, setUseDocs] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const [stage, setStage] = useState<WebsiteAssistantStage | ''>('');
  const progress = useRef<WebsiteAssistantProgress>({ app: existingApp });
  const url = normaliseWebsite(website);
  const ready = !busy && !uncertain && (useDocs ? files.length > 0 : Boolean(url));

  const create = async () => {
    if (!ready) return;
    setBusy(true);
    setError('');
    try {
      const { app, jobId } = await createWebsiteAssistant(
        { name: existingApp.displayName, website: useDocs ? null : url, files: useDocs ? files : undefined, existingApp, prompt: t('onboarding.website.defaultPrompt') },
        progress.current,
        setStage
      );
      onClose();
      navigate(`/app/admin/apps/${app._id}`, { state: { justCreated: true, jobId } });
    } catch (e) {
      const err = e as WebsiteAssistantError;
      if (err.uncertain) setUncertain(true);
      const key = `onboarding.error.${err.message}`;
      setError(t(key) === key ? err.message : t(key));
    } finally {
      setBusy(false);
      setStage('');
    }
  };

  return (
    <Dialog open onClose={() => { if (!busy) onClose(); }} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6">
          <DialogTitle className="text-xl font-semibold">{t('onboarding.website.title')}</DialogTitle>
          <p className="text-sm text-gray-600">{useDocs ? t('onboarding.website.subtitleDocs') : t('onboarding.website.subtitle')}</p>
          {useDocs ? (
            <label className="block text-sm font-medium">
              {t('onboarding.website.docsLabel')}
              <input type="file" multiple accept=".pdf,.doc,.docx,.txt,.md,.csv,.html" disabled={busy} onChange={(e) => setFiles(Array.from(e.target.files || []))} className="mt-1 w-full rounded-lg border border-dashed p-3 text-sm" />
            </label>
          ) : (
            <label className="block text-sm font-medium">
              {t('onboarding.website.websiteLabel')}
              <input autoFocus type="text" inputMode="url" value={website} onChange={(e) => setWebsite(e.target.value)} disabled={busy} placeholder="https://yourbusiness.com" className="mt-1 w-full rounded-lg border px-3 py-2" />
            </label>
          )}
          {busy && <p role="status" className="text-sm">{t(`onboarding.stage.${stage || 'connecting'}`)}</p>}
          {error && <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error} {uncertain && t('onboarding.error.checkBeforeRetry')}</div>}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" className="text-sm text-gray-700 underline" disabled={busy} onClick={() => setUseDocs(!useDocs)}>
              {useDocs ? t('onboarding.website.useWebsite') : t('onboarding.website.useDocs')}
            </button>
            <div className="flex gap-2">
              <button type="button" disabled={busy} onClick={onClose} className="rounded-lg border px-4 py-2">{t('onboarding.cancel')}</button>
              <button type="button" disabled={!ready} onClick={() => void create()} className="rounded-lg bg-brand-500 px-4 py-2 text-white disabled:opacity-50">
                {error ? t('onboarding.retry') : t('onboarding.website.create')}
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
