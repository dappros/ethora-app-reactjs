import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ActiveAgentCard } from '../../components/AIWidget/ActiveAgentCard';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelAIbot, ModelApp } from '../../models';
import { httpUpdateApp } from '../../http';
import { useAppStore } from '../../store/useAppStore';
import { toast } from 'react-toastify';

export function AppAISettings({ app, aiBot, setAiBot, disabled }: { app: ModelApp; aiBot: ModelAIbot; setAiBot: (bot: ModelAIbot) => void; disabled: boolean }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try { const { data } = await httpUpdateApp(app._id, { botStatus: aiBot.status === 'on' ? 'off' : 'on' }); if (data.result?.aiBot) { useAppStore.getState().doUpdateApp(data.result); setAiBot(data.result.aiBot); } }
    catch { toast.error(t('appSettings.saveFailed')); }
    finally { setBusy(false); }
  };
  return <div className="space-y-5 overflow-y-auto p-2 md:p-4">
    <div><h2 className="text-xl font-semibold">AI</h2><p className="mt-2 text-sm text-gray-500">{t('widgets.appAIIntro')}</p></div>
    <ActiveAgentCard appId={app._id} app={app} enabled={aiBot.status === 'on'} onToggle={() => void toggle()} disabled={disabled || busy} conversationsTotal={null} appContext />
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="rounded-xl border border-gray-200 p-5"><h3 className="font-semibold">{t('appSettingsAIWidget.configTab')}</h3><p className="mt-2 text-sm text-gray-500">{t('widgets.configIntro')}</p><Link className="mt-5 inline-block text-sm font-semibold text-brand-500" to={`/app/admin/apps/${app._id}/ai`}>{t('widgets.openConfig')} →</Link></section>
      <section className="rounded-xl border border-gray-200 p-5"><h3 className="font-semibold">{t('widgets.websiteWidget')}</h3><p className="mt-2 text-sm text-gray-500">{t('widgets.widgetIntro')}</p><Link className="mt-5 inline-block text-sm font-semibold text-brand-500" to={`/app/admin/widgets/${app._id}`}>{t('widgets.edit')} →</Link></section>
    </div>
  </div>;
}
