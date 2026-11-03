import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { env } from '../../config/env';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelApp } from '../../models';
import { CreateWidgetModal } from './CreateWidgetModal';

type Intent = 'website' | 'chat' | 'calls' | 'selfHost';

export function AppIntentModal({ app, onClose }: { app: ModelApp; onClose: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [intent, setIntent] = useState<Intent>(env.VITE_AI_FEATURE_ENABLED === 'true' ? 'website' : 'chat');
  const [websiteSetup, setWebsiteSetup] = useState(false);
  const closeToSettings = () => { onClose(); navigate(`/app/admin/apps/${app._id}/settings`); };
  const proceed = () => {
    if (intent === 'website') { setWebsiteSetup(true); return; }
    onClose();
    if (intent === 'chat') navigate(`/app/admin/apps/${app._id}/settings?tab=Chat%20component`);
    else if (intent === 'calls') navigate(`/app/admin/apps/${app._id}/settings?tab=Chats`);
    else navigate('/app/help');
  };
  if (websiteSetup) return <CreateWidgetModal existingApp={app} onClose={() => setWebsiteSetup(false)} />;
  return <Dialog open onClose={closeToSettings} className="relative z-50">
    <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel className="w-full max-w-xl rounded-2xl bg-white p-6">
        <DialogTitle className="text-xl font-semibold">{t('appIntent.title')}</DialogTitle>
        <p className="mt-2 text-sm text-gray-600">{t('appIntent.description')}</p>
        <fieldset className="mt-5 space-y-2">
          <legend className="sr-only">{t('appIntent.title')}</legend>
          {(['website', 'chat', 'calls', 'selfHost'] as Intent[]).map((item) => {
            const disabled = item === 'website' && env.VITE_AI_FEATURE_ENABLED !== 'true';
            return <label key={item} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${intent === item ? 'border-brand-500 bg-blue-50' : 'border-gray-200'} ${disabled ? 'opacity-50' : ''}`}>
              <input type="radio" name="app-intent" value={item} checked={intent === item} disabled={disabled} onChange={() => setIntent(item)} className="mt-1" />
              <span><span className="block font-semibold">{t(`appIntent.${item}`)}</span><span className="block text-sm text-gray-600">{t(`appIntent.${item}Description`)}</span></span>
            </label>;
          })}
        </fieldset>
        <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{t(`appIntent.${intent}Steps`)}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={closeToSettings} className="rounded-lg border px-4 py-2">{t('appIntent.later')}</button>
          <button type="button" disabled={intent === 'website' && env.VITE_AI_FEATURE_ENABLED !== 'true'} onClick={proceed} className="rounded-lg bg-brand-500 px-4 py-2 text-white disabled:opacity-50">{t('appIntent.continue')}</button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>;
}
