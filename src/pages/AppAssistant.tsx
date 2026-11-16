import { isEqual } from 'lodash';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ActiveAgentSelector } from '../components/AIWidget/ActiveAgentSelector';
import { AssistantAppearancePanel } from '../components/AIWidget/AssistantAppearancePanel';
import { TabAIWidgetCode } from '../components/AIWidget/TabAIWidget/TabAIWidgetCode';
import {
  ChatsIndexPanel,
  ContextPanel,
  DocsIndexPanel,
  FlowsPanel,
  HeartbeatPanel,
  PersonaPanel,
  SoulMdPanel,
  WebIndexPanel,
} from '../components/Agents/panels/AgentPanels';
import { TryItPanel } from '../components/Agents/panels/TryItPanel';
import { CreateWidgetModal } from '../components/modal/CreateWidgetModal';
import { env } from '../config/env';
import { AgentKnowledgeHealth, httpGetAgentKnowledge, httpGetApp, httpGetWidgetAppearance, httpSaveWidgetAppearance, httpUpdateApp } from '../http';
import { useAppAssistant } from '../hooks/useAppAssistant';
import { useTranslation } from '../i18n/useTranslation';
import {
  AiWidgetAppearance,
  appearanceFromAttributes,
  clearLegacyBrowserAppearance,
  defaultAiWidgetAppearance,
  getAppearanceAttributeRecord,
  loadLegacyBrowserAppearance,
} from '../lib/aiWidgetAppearance';
import { ModelAgent } from '../models';
import { useAppStore } from '../store/useAppStore';
import { countLabel } from '../utils/countLabel';
import { resolveWidgetUrl } from '../utils/widgetUrl';
import { readWidgetAppearanceDraft, writeWidgetAppearanceDraft } from '../utils/widgetAppearanceDraft';

type Knows = 'web' | 'docs' | null;
type Advanced = 'memory' | 'heartbeat' | 'flows' | 'model' | 'chats' | 'agent' | null;

// The App's AI assistant on one page: what it knows, how it answers, how it
// looks, where it is installed, with the test chat always in view. The
// agent's other panels sit under Advanced; they are the same components as
// the Agents library, which stays the place for agents shared across Apps.
export default function AppAssistant() {
  const { t } = useTranslation();
  const { appId } = useParams();
  const location = useLocation();
  const app = useAppStore((s) => s.apps.find((a) => a._id === appId));
  const doSetApp = useAppStore((s) => s.doSetApp);
  const currentUserId = useAppStore((s) => (s.currentUser as { _id?: string } | null)?._id);
  const { agent, ownAgents } = useAppAssistant(app);
  const [health, setHealth] = useState<AgentKnowledgeHealth | null>(null);
  const [knows, setKnows] = useState<Knows>(null);
  const [showPersona, setShowPersona] = useState(false);
  const [showLook, setShowLook] = useState(false);
  const [advanced, setAdvanced] = useState<Advanced>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toggling, setToggling] = useState(false);
  const appearanceEditor = useWidgetAppearance(appId);

  const readOnly = Boolean(agent && currentUserId && String(agent.ownerId) !== String(currentUserId));

  const refreshHealth = useCallback(() => {
    if (!agent?.id) return;
    httpGetAgentKnowledge(agent.id).then(({ data }) => setHealth(data)).catch(() => {});
  }, [agent?.id]);
  useEffect(refreshHealth, [refreshHealth, knows]);

  // Links from App Home land on a section: #knows, #test, #install.
  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (!id || !agent) return;
    if (id === 'knows' && health && health.pages + health.docs === 0) setKnows('web');
    if (id === 'docs') setKnows('docs');
    const target = id === 'docs' ? 'knows' : id === 'test' && window.innerWidth < 1024 ? 'test-narrow' : id;
    window.setTimeout(() => document.getElementById(`assistant-${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, [location.hash, agent, health]);

  if (!app || !appId) return null;

  if (!agent) {
    return (
      <section className="max-w-2xl rounded-xl border border-gray-200 bg-white p-5" data-testid="assistant-empty">
        <h2 className="text-lg font-semibold">{t('appAssistant.emptyTitle')}</h2>
        <p className="mt-1 text-sm text-gray-600">{t('appAssistant.emptyText')}</p>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          disabled={env.VITE_AI_FEATURE_ENABLED !== 'true'}
          className="mt-4 h-10 rounded-xl bg-brand-500 px-5 font-semibold text-white hover:bg-brand-darker disabled:opacity-50"
        >
          {t('appAssistant.emptyAction')}
        </button>
        {env.VITE_AI_FEATURE_ENABLED !== 'true' && <p className="mt-2 text-sm text-gray-500">{t('onboarding.goal.websiteDisabled')}</p>}
        {ownAgents > 0 && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <p className="mb-2 text-sm text-gray-600">{t('appAssistant.useExisting')}</p>
            <ActiveAgentSelector appId={appId} app={app} bare />
          </div>
        )}
        {showCreate && <CreateWidgetModal existingApp={app} onClose={() => setShowCreate(false)} />}
      </section>
    );
  }

  const on = app.aiBot?.status === 'on';
  const toggle = async () => {
    setToggling(true);
    try {
      const r = await httpUpdateApp(appId, { botStatus: on ? 'off' : 'on' });
      if (r?.data?.result) doSetApp({ ...app, ...r.data.result });
    } catch {
      toast.error(t('appAssistant.toggleFailed'));
    } finally {
      setToggling(false);
    }
  };

  const installedHost = (app.milestones?.widget_installed?.meta?.host as string) || '';
  const testHost = (app.milestones?.widget_test_page?.meta?.host as string) || '';
  const pages = health?.pages ?? 0;
  const docs = health?.docs ?? 0;
  const widgetUrl = resolveWidgetUrl();
  const snippet = `<script src="${widgetUrl}" id="chat-content-assistant" data-app-id="${appId}"${env.VITE_API ? ` data-api-base="${env.VITE_API}"` : ''}></script>`;
  const mailto = `mailto:?subject=${encodeURIComponent(t('appAssistant.install.mailSubject'))}&body=${encodeURIComponent(
    t('appAssistant.install.mailBody').replace('{snippet}', snippet)
  )}`;

  const toggleKnows = (next: Knows) => setKnows((cur) => (cur === next ? null : next));
  const toggleAdvanced = (next: Advanced) => setAdvanced((cur) => (cur === next ? null : next));

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]" data-testid="app-assistant">
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">{agent.displayName}</h2>
            <p className="text-sm text-gray-600">
              {!on
                ? t('appAssistant.statusOff')
                : installedHost
                  ? t('appAssistant.statusLive').replace('{host}', installedHost)
                  : t('appAssistant.statusReady')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" role="switch" checked={on} disabled={toggling} onChange={() => void toggle()} className="size-4" />
              {t('appAssistant.answersVisitors')}
            </label>
          </div>
        </div>
        {readOnly && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{t('appAssistant.readOnly')}</p>}

        <Section id="knows" num={1} title={t('appAssistant.knows.title')} badge={`${countLabel(t, 'pages', pages)} · ${countLabel(t, 'docs', docs)}`} badgeOk={pages + docs > 0}>
          <p className="text-sm text-gray-600">{t('appAssistant.knows.text')}</p>
          {health?.rebuilding && <p className="mt-1 text-sm text-gray-600">{t('appAssistant.knows.rebuilding')}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Toggle active={knows === 'web'} onClick={() => toggleKnows('web')}>{pages ? t('appAssistant.knows.seePages') : t('appAssistant.knows.addWebsite')}</Toggle>
            <Toggle active={knows === 'docs'} onClick={() => toggleKnows('docs')}>{t('appAssistant.knows.uploadDocs')}</Toggle>
          </div>
          {knows === 'web' && <Panel><WebIndexPanel agent={agent} appId={appId} isDisabled={readOnly} /></Panel>}
          {knows === 'docs' && <Panel><DocsIndexPanel agent={agent} appId={appId} isDisabled={readOnly} /></Panel>}
        </Section>

        {/* Below lg the test chat follows "What it knows" instead of sitting
            under everything else. */}
        <div className="lg:hidden">
          <TestBox agent={agent} appId={appId} id="assistant-test-narrow" />
        </div>

        <Section id="answers" num={2} title={t('appAssistant.answers.title')}>
          <p className="text-sm text-gray-600">{t('appAssistant.answers.text')}</p>
          <Panel><ContextPanel agent={agent} isDisabled={readOnly} /></Panel>
          <div className="mt-2">
            <Toggle active={showPersona} onClick={() => setShowPersona(!showPersona)}>{t('appAssistant.answers.persona')}</Toggle>
          </div>
          {showPersona && <Panel><PersonaPanel agent={agent} isDisabled={readOnly} /></Panel>}
        </Section>

        {appearanceEditor.legacy && (
          <div role="status" className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm dark:border-blue-900 dark:bg-blue-950/40">
            <span className="min-w-[16rem] flex-1">{t('aiWidgetAppearance.legacyFound')}</span>
            <button type="button" onClick={appearanceEditor.keepLegacy} className="rounded-lg bg-brand-500 px-3 py-1.5 font-semibold text-white">{t('aiWidgetAppearance.legacySave')}</button>
            <button type="button" onClick={appearanceEditor.discardLegacy} className="rounded-lg px-3 py-1.5">{t('aiWidgetAppearance.legacyDiscard')}</button>
          </div>
        )}

        <Section id="looks" num={3} title={t('appAssistant.looks.title')} badge={appearanceEditor.dirty ? t('appAssistant.looks.unsaved') : undefined}>
          <p className="text-sm text-gray-600">{t('appAssistant.looks.text')}</p>
          <div className="mt-3">
            <Toggle active={showLook} onClick={() => setShowLook(!showLook)}>{t('appAssistant.looks.customize')}</Toggle>
          </div>
          {showLook && appearanceEditor.loaded && (
            <div className="mt-3">
              <AssistantAppearancePanel
                embedded
                appearance={appearanceEditor.appearance}
                onChange={appearanceEditor.change}
                onSave={appearanceEditor.save}
                onReset={appearanceEditor.reset}
                isDirty={appearanceEditor.dirty}
                brandColor={app.primaryColor}
                botName={agent.displayName}
                botAvatar={agent.avatarUrl || undefined}
              />
            </div>
          )}
        </Section>

        <Section
          id="install"
          num={4}
          title={t('appAssistant.install.title')}
          badge={
            installedHost
              ? t('appAssistant.install.liveOn').replace('{host}', installedHost)
              : testHost
                ? t('appAssistant.install.testPage').replace('{host}', testHost)
                : t('appAssistant.install.notDetected')
          }
          badgeOk={Boolean(installedHost || testHost)}
        >
          <p className="text-sm text-gray-600">{t('appAssistant.install.text')}</p>
          <div className="mt-3 overflow-x-auto rounded-lg border border-gray-100">
            <InstallCode appId={appId} appearance={appearanceEditor.saved} />
          </div>
          <p className="mt-3 text-sm">
            <a className="text-brand-500 underline" href={mailto}>{t('appAssistant.install.email')}</a>
          </p>
        </Section>

        <details className="rounded-xl border border-dashed border-gray-300 bg-white p-4" data-testid="assistant-advanced">
          <summary className="cursor-pointer font-semibold">
            {t('appAssistant.advanced.title')}{' '}
            <span className="font-normal text-gray-500">{t('appAssistant.advanced.summary')}</span>
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            <Toggle active={advanced === 'memory'} onClick={() => toggleAdvanced('memory')}>{t('appAssistant.advanced.memory')}</Toggle>
            <Toggle active={advanced === 'heartbeat'} onClick={() => toggleAdvanced('heartbeat')}>{t('appAssistant.advanced.heartbeat')}</Toggle>
            <Toggle active={advanced === 'flows'} onClick={() => toggleAdvanced('flows')}>{t('appAssistant.advanced.flows')}</Toggle>
            <Toggle active={advanced === 'chats'} onClick={() => toggleAdvanced('chats')}>{t('appAssistant.advanced.chats')}</Toggle>
            {ownAgents > 1 && <Toggle active={advanced === 'agent'} onClick={() => toggleAdvanced('agent')}>{t('appAssistant.advanced.otherAgent')}</Toggle>}
          </div>
          {advanced === 'memory' && <Panel><SoulMdPanel agent={agent} isDisabled={readOnly} /></Panel>}
          {advanced === 'heartbeat' && <Panel><HeartbeatPanel agent={agent} isDisabled={readOnly} /></Panel>}
          {advanced === 'flows' && <Panel><FlowsPanel agent={agent} isDisabled={readOnly} /></Panel>}
          {advanced === 'chats' && <Panel><ChatsIndexPanel agent={agent} isDisabled={readOnly} /></Panel>}
          {advanced === 'agent' && <Panel><ActiveAgentSelector appId={appId} app={app} bare /></Panel>}
          <p className="mt-3 text-sm text-gray-600">
            {t('appAssistant.advanced.libraryPrefix')}{' '}
            <Link className="text-brand-500 underline" to={`/app/admin/agents/${agent.id}/settings?fromApp=${appId}`}>{t('appAssistant.advanced.libraryLink')}</Link>
          </p>
        </details>
      </div>

      <aside className="hidden lg:sticky lg:top-0 lg:block lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
        <TestBox agent={agent} appId={appId} id="assistant-test" />
      </aside>
    </div>
  );
}

function TestBox({ agent, appId, id }: { agent: ModelAgent; appId: string; id: string }) {
  const { t } = useTranslation();
  return (
    <section id={id} className="scroll-mt-4 rounded-xl border border-gray-200 bg-white p-4" data-testid={id}>
      <h3 className="mb-1 font-semibold">{t('appAssistant.test.title')}</h3>
      <p className="mb-2 text-sm text-gray-600">{t('appAssistant.test.text')}</p>
      <TryItPanel agent={agent} compact />
      <TestedRefresher appId={appId} />
    </section>
  );
}

function Section({ id, num, title, badge, badgeOk, children }: { id: string; num: number; title: string; badge?: string; badgeOk?: boolean; children: ReactNode }) {
  return (
    <section id={`assistant-${id}`} className="scroll-mt-4 rounded-xl border border-gray-200 bg-white p-4" data-testid={`assistant-section-${id}`}>
      <h3 className="mb-1 flex flex-wrap items-center justify-between gap-2 font-semibold">
        <span>{num} · {title}</span>
        {badge && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeOk ? 'bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300' : 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'}`}>
            {badge}
          </span>
        )}
      </h3>
      {children}
    </section>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-expanded={active}
      onClick={onClick}
      className={`min-h-9 rounded-lg border px-3 text-sm font-semibold ${active ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-300 bg-white text-gray-800 hover:border-brand-500'}`}
    >
      {children}
    </button>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="mt-3 rounded-lg border border-gray-100 p-2">{children}</div>;
}

// `appearance`: the saved one, written into the snippet when it is pinned.
function InstallCode({ appId, appearance }: { appId: string; appearance: AiWidgetAppearance }) {
  const [value, setValue] = useState('1');
  const app = useAppStore((s) => s.apps.find((a) => a._id === appId));
  return <TabAIWidgetCode value={value} appId={appId} app={app} userId={app?.aiBot?.userId} appearance={appearance} handleChange={(_, v) => setValue(v)} />;
}

// Try it records the agent_tested milestone server-side; pick it up for the
// App Home checklist when the owner leaves this page.
function TestedRefresher({ appId }: { appId: string }) {
  const doSetApp = useAppStore((s) => s.doSetApp);
  useEffect(() => () => {
    httpGetApp(appId).then((r) => doSetApp(r.data.result)).catch(() => {});
  }, [appId, doSetApp]);
  return null;
}

// Saved widget appearance and the draft being edited (same storage as the
// former AI Widget tab: App.widgetAppearance, read by every live embed).
function useWidgetAppearance(appId?: string) {
  const { t } = useTranslation();
  const [appearance, setAppearance] = useState<AiWidgetAppearance>(defaultAiWidgetAppearance);
  const [saved, setSaved] = useState<AiWidgetAppearance>(defaultAiWidgetAppearance);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  // Settings an older build of the AI Widget tab kept in this browser only,
  // offered once for saving to the server when the server holds none.
  const [legacy, setLegacy] = useState<AiWidgetAppearance | null>(null);
  // The App the appearance state belongs to. Draft reads and writes only
  // happen while it equals appId: right after switching App the state still
  // holds the previous App's values, which must never be written (or a
  // draft deleted) under the new App's key.
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!appId) return;
    let cancelled = false;
    setLoaded(false);
    setLoadedFor(null);
    httpGetWidgetAppearance(appId)
      .then((resp) => {
        if (cancelled) return;
        const attrs = resp?.data?.appearance || {};
        const next = appearanceFromAttributes(attrs);
        const draft = readWidgetAppearanceDraft(appId, getAppearanceAttributeRecord(next));
        setAppearance(draft ? appearanceFromAttributes(draft) : next);
        setSaved(next);
        setLegacy(Object.keys(attrs).length ? null : loadLegacyBrowserAppearance(appId));
        setLoadedFor(appId);
      })
      .catch(() => !cancelled && toast.error(t('aiWidgetAppearance.loadFailed')))
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [appId, t]);

  // Keep the unsaved draft for this App in the tab (survives a reload).
  useEffect(() => {
    if (!appId || !loaded || loadedFor !== appId) return;
    const base = getAppearanceAttributeRecord(saved);
    const values = getAppearanceAttributeRecord(appearance);
    writeWidgetAppearanceDraft(appId, base, isEqual(appearance, saved) ? null : values);
  }, [appId, loaded, loadedFor, appearance, saved]);

  const persist = useCallback(async (value: AiWidgetAppearance): Promise<boolean> => {
    if (!appId || saving) return false;
    setSaving(true);
    try {
      const resp = await httpSaveWidgetAppearance(appId, getAppearanceAttributeRecord(value));
      const stored = appearanceFromAttributes(resp?.data?.appearance || {});
      setAppearance(stored);
      setSaved(stored);
      toast.success(t('aiWidgetAppearance.saved'));
      return true;
    } catch (error) {
      toast.error((error as { response?: { data?: { error?: string } } })?.response?.data?.error || t('aiWidgetAppearance.saveFailed'));
      return false;
    } finally {
      setSaving(false);
    }
  }, [appId, saving, t]);

  return {
    appearance,
    saved,
    loaded,
    dirty: loaded && !isEqual(appearance, saved),
    change: (updates: Partial<AiWidgetAppearance>) => setAppearance((prev) => ({ ...prev, ...updates })),
    reset: () => setAppearance(defaultAiWidgetAppearance),
    save: () => void persist(appearance),
    legacy,
    keepLegacy: () => {
      if (!legacy || !appId) return;
      void persist(legacy).then((ok) => {
        if (!ok) return;
        clearLegacyBrowserAppearance(appId);
        setLegacy(null);
      });
    },
    discardLegacy: () => {
      if (appId) clearLegacyBrowserAppearance(appId);
      setLegacy(null);
    },
  };
}
