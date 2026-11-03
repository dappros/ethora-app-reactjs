import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ActiveAgentCard } from '../../components/AIWidget/ActiveAgentCard';
import { ActiveAgentSelector } from '../../components/AIWidget/ActiveAgentSelector';
import { ConfigAIPanel } from '../../components/AIWidget/ConfigAIPanel';
import { useActiveWidgetAgent } from '../../hooks/useActiveWidgetAgent';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelAIbot, ModelApp } from '../../models';
import { httpUpdateApp } from '../../http';
import { useAppStore } from '../../store/useAppStore';
import { toast } from 'react-toastify';
import { AIWidget } from './AIWidget';

type Props = {
  app: ModelApp;
  aiBot: ModelAIbot;
  setAiBot: (bot: ModelAIbot) => void;
  disabled: boolean;
  onWidgetDirtyChange: (dirty: boolean) => void;
};

export function AppAISettings({ app, aiBot, setAiBot, disabled, onWidgetDirtyChange }: Props) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const panel = searchParams.get('panel');
  const activeAgent = useActiveWidgetAgent(app);
  const updateWidgetDirty = useCallback((dirty: boolean) => onWidgetDirtyChange(dirty), [onWidgetDirtyChange]);
  const showPanel = (value: 'widget' | 'assistant' | null) => setSearchParams((current) => {
    const next = new URLSearchParams(current);
    if (value) next.set('panel', value);
    else next.delete('panel');
    return next;
  });
  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try { const { data } = await httpUpdateApp(app._id, { botStatus: aiBot.status === 'on' ? 'off' : 'on' }); if (data.result?.aiBot) { useAppStore.getState().doUpdateApp(data.result); setAiBot(data.result.aiBot); } }
    catch { toast.error(t('appSettings.saveFailed')); }
    finally { setBusy(false); }
  };
  if (panel === 'widget') return <div className="space-y-4 overflow-y-auto p-2 md:p-4">
    <button type="button" onClick={() => showPanel(null)} className="text-sm font-semibold text-brand-500 hover:underline">← {t('widgets.backToAI')}</button>
    <AIWidget
      appId={app._id}
      app={app}
      aiBot={aiBot}
      setAiBot={setAiBot}
      defaultChatRooms={app.defaultRooms || []}
      primaryColor={app.primaryColor}
      isDisabled={disabled}
      aiFeatureDisabled={disabled}
      handleRagChange={() => {}}
      initialTab="appearance"
      showAgentCard={false}
      appearanceOnly
      onAppearanceDirtyChange={updateWidgetDirty}
    />
  </div>;
  if (panel === 'assistant') return <div className="space-y-4 overflow-y-auto p-2 md:p-4">
    <button type="button" onClick={() => showPanel(null)} className="text-sm font-semibold text-brand-500 hover:underline">← {t('widgets.backToAI')}</button>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h2 className="text-xl font-semibold">{t('widgets.openConfig')}</h2><p className="mt-1 text-sm text-gray-600">{t('widgets.configIntro')}</p></div>
      <ActiveAgentSelector appId={app._id} app={app} bare label={t('aiWidgetAgentCard.pickLabel')} />
    </div>
    <div className="rounded-xl border border-gray-200 bg-white"><ConfigAIPanel appId={app._id} activeAgent={activeAgent} /></div>
  </div>;
  return <div className="space-y-5 overflow-y-auto p-2 md:p-4">
    <div><h2 className="text-xl font-semibold">AI</h2><p className="mt-2 text-sm text-gray-500">{t('widgets.appAIIntro')}</p></div>
    <ActiveAgentCard appId={app._id} app={app} enabled={aiBot.status === 'on'} onToggle={() => void toggle()} disabled={disabled || busy} conversationsTotal={null} appContext />
    <section className="rounded-xl border border-brand-200 bg-brand-50 p-5">
      <h3 className="font-semibold">{t('widgets.websiteWidget')}</h3>
      <p className="mt-2 text-sm text-gray-600">{t('projectOverview.widgetText')}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-darker focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500" onClick={() => showPanel('widget')}>{t('widgets.edit')}</button>
        <button type="button" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-brand-200 bg-white px-5 text-sm font-semibold text-brand-500 hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500" onClick={() => showPanel('assistant')}>{t('widgets.openConfig')}</button>
      </div>
    </section>
  </div>;
}
