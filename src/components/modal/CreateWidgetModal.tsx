import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { actionCreateAgent, actionCreateApp, actionInviteAgentToChat, actionSetBotInstanceStatus } from '../../actions';
import { httpAgentSiteCrawl, httpUpdateApp, httpPrepareWidgetAgent } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelAgent, ModelApp } from '../../models';
import { phCapture } from '../../posthog';
import { setOnboardingIntent } from '../../utils/onboardingIntent';

/** A short entry point for owners who want a website assistant. */
export function CreateWidgetModal({ onClose, existingApp }: { onClose: () => void; existingApp?: ModelApp }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState(existingApp?.displayName || '');
  const [website, setWebsite] = useState('');
  const [app, setApp] = useState<ModelApp | null>(existingApp || null);
  const [agent, setAgent] = useState<ModelAgent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('');
  const [uncertain, setUncertain] = useState(false);

  const create = async () => {
    const displayName = name.trim();
    if (displayName.length < 3 || busy) return;
    if (website.trim()) {
      try {
        const url = new URL(website.trim());
        if (!['https:', 'http:'].includes(url.protocol)) throw new Error();
      } catch {
        setError(t('widgetSetup.invalidWebsite'));
        return;
      }
    }
    setBusy(true);
    setError('');
    let currentApp = app;
    let currentAgent = agent;
    try {
      if (!currentApp) {
        setStage(t('widgetSetup.creatingApp'));
        currentApp = await actionCreateApp(displayName);
        if (!currentApp?._id) throw new Error(t('widgetSetup.missingApp'));
        setApp(currentApp);
      }
      if (!currentAgent) {
        setStage(t('widgetSetup.creatingAgent'));
        currentAgent = await actionCreateAgent({ displayName, ownerAppId: currentApp._id, visibility: 'private', prompt: 'You are a helpful customer support assistant. Use the available knowledge to answer accurately. If you do not know the answer, say so.' });
        if (!currentAgent?.id) throw new Error(t('widgetSetup.missingAgent'));
        setAgent(currentAgent);
      }
      const chatId = currentApp.aiBot?.chatId;
      setStage(t('widgetSetup.connecting'));
      const result = chatId ? await actionInviteAgentToChat(currentAgent.id, { appId: currentApp._id, chatId }) : (await httpPrepareWidgetAgent(currentApp._id, currentAgent.id)).data;
      const instance = result?.botInstance || result?.respData?.botInstance;
      if (!instance?.id) throw new Error(t('widgetSetup.missingConnection'));
      const saved = await httpUpdateApp(currentApp._id, { defaultBotInstanceId: instance.id, botStatus: 'on' });
      if (String(saved.data?.result?.defaultBotInstanceId || '') !== String(instance.id) || saved.data?.result?.aiBot?.status !== 'on') {
        throw new Error(t('widgetSetup.activationUnconfirmed'));
      }
      // App creation may have already invited the system Support Agent to the
      // same room. Stop that instance so both bots do not answer visitors.
      const previousId = (currentApp as ModelApp & { defaultBotInstanceId?: string }).defaultBotInstanceId;
      if (previousId && previousId !== instance.id) {
        const stopped = await actionSetBotInstanceStatus(previousId, 'off');
        if (stopped?.status !== 'off') throw new Error(t('widgetSetup.previousUnconfirmed'));
      }
      let jobId = '';
      if (website.trim()) {
        setStage(t('widgetSetup.addingWebsite'));
        try {
          const crawl = await httpAgentSiteCrawl(currentApp._id, currentAgent.id, website.trim(), true);
          jobId = crawl.data?.jobId || '';
          if (jobId) phCapture('onboarding_crawl_started', { intent: 'website' });
        } catch (e) {
          const response = (e as { response?: { data?: { code?: string } } }).response;
          // A retry after a lost response can find an already-indexed page.
          if (response?.data?.code !== 'SITE_SOURCE_ALREADY_INDEXED') throw e;
        }
      }
      // Keep the setup visible after navigation and reload in this browser tab.
      try { sessionStorage.setItem(`widget-setup:${currentApp._id}`, JSON.stringify({ agentId: currentAgent.id, jobId })); } catch { /* Storage may be unavailable. */ }
      localStorage.removeItem('newUser');
      setOnboardingIntent(null);
      phCapture('onboarding_project_created', { intent: 'website', has_website: Boolean(website.trim()) });
      onClose();
      navigate(`/app/admin/apps/${currentApp._id}/assistant`);
    } catch (e) {
      const err = e as { message?: string; response?: { data?: { error?: string } } };
      // A lost response from a create request may still have created the item.
      // Do not offer an automatic retry until its outcome can be inspected.
      if ((!currentApp || !currentAgent) && !err.response) setUncertain(true);
      setError(err.response?.data?.error || err.message || t('widgetSetup.failed'));
    } finally {
      setBusy(false);
      setStage('');
    }
  };

  return (
    <Dialog open onClose={() => { if (!busy) onClose(); }} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg rounded-2xl bg-white p-6 space-y-4">
          <DialogTitle className="text-xl font-semibold">{t('widgetSetup.title')}</DialogTitle>
          <p className="text-sm text-gray-600">{existingApp ? t('widgetSetup.existingApp').replace('{name}', existingApp.displayName) : t('widgetSetup.description')}</p>
          {!existingApp && <label className="block text-sm font-medium">{t('widgetSetup.name')}
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} disabled={busy || Boolean(app)} maxLength={100} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>}
          <label className="block text-sm font-medium">{t('widgetSetup.website')}
            <input autoFocus={Boolean(existingApp)} type="url" value={website} onChange={(e) => setWebsite(e.target.value)} disabled={busy} placeholder="https://example.com" className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <p className="text-sm text-gray-600">{t('widgetSetup.next')}</p>
          {busy && <p role="status">{stage}</p>}
          {error && <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error} {uncertain && t('widgetSetup.checkBeforeRetry')}</div>}
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" disabled={busy} onClick={onClose} className="rounded-lg border px-4 py-2">{t('widgetSetup.cancel')}</button>
            <button type="button" disabled={busy || uncertain || name.trim().length < 3} onClick={() => void create()} className="rounded-lg bg-brand-500 px-4 py-2 text-white disabled:opacity-50">{t(error ? 'widgetSetup.retry' : 'widgetSetup.create')}</button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
