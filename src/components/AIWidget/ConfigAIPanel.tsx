import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './ConfigAIPanel.css';
import { actionGetAgent, actionLoadOwnedApps } from '../../actions';
import {
  ChatsIndexPanel, ContextPanel, DocsIndexPanel, FlowsPanel, HeartbeatPanel,
  PersonaPanel, SoulMdPanel, WebIndexPanel,
} from '../Agents/panels/AgentPanels';
import { TryItPanel } from '../Agents/panels/TryItPanel';
import { AgentBotInstanceRow, WebsiteWidgetPanel } from '../Agents/panels/WebsiteWidgetPanel';
import { VisibilityPanel } from '../Agents/panels/VisibilityPanel';
import { httpListAgentBotInstances } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelAgent, ModelAppDefaulRooom } from '../../models';
import { useAppStore } from '../../store/useAppStore';
import { WidgetSetupGuide } from './WidgetSetupGuide';
import { PanelSkeleton } from '../PanelSkeleton';

const SECTIONS = [
  { label: 'agentSettings.sectionIdentity', tabs: ['agentSettings.tabPersona', 'agentSettings.tabInstructions'] },
  { label: 'agentSettings.sectionKnowledge', tabs: ['agentSettings.tabWebIndex', 'agentSettings.tabDocsIndex'] },
  { label: 'agentSettings.sectionBehaviour', tabs: ['agentSettings.tabMemory', 'agentSettings.tabHeartbeat', 'agentSettings.tabFlows'] },
  { label: 'agentSettings.sectionActivity', tabs: ['agentSettings.tabTryIt', 'agentSettings.tabWebsiteWidget', 'agentSettings.tabChatsIndex'] },
  { label: 'agentSettings.sectionSharing', tabs: ['agentSettings.tabVisibility'] },
] as const;
const TABS = SECTIONS.flatMap((section) => section.tabs);
const CHATS_SECTION_INDEX = TABS.indexOf('agentSettings.tabChatsIndex');
const sectionKey = (appId: string, agentId: string) => `config-ai-section:${appId}:${agentId}`;

function readSection(appId: string, agentId?: string): number {
  if (!agentId) return 0;
  try {
    const value = Number(sessionStorage.getItem(sectionKey(appId, agentId)));
    return Number.isInteger(value) && value >= 0 && value < TABS.length ? value : 0;
  } catch { return 0; }
}

/** The same agent panels used by Agent Settings, scoped to this App's widget. */
export function ConfigAIPanel({ appId, activeAgent, defaultChatRooms = [] }: { appId: string; activeAgent: ModelAgent | null; defaultChatRooms?: ModelAppDefaulRooom[] }) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const chatsRequested = searchParams.get('section') === 'chats';
  const agentId = activeAgent?.id;
  const selectionContext = `${appId}:${agentId || ''}`;
  const lastSelectionContext = useRef(selectionContext);
  const [agent, setAgent] = useState<ModelAgent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState(() => readSection(appId, agentId));
  const [instances, setInstances] = useState<AgentBotInstanceRow[]>([]);
  const [instancesLoading, setInstancesLoading] = useState(false);
  const [instancesError, setInstancesError] = useState(false);
  const user = useAppStore((s) => s.currentUser);
  const storeAgent = useAppStore((s) => s.agents.find((a) => a.id === agentId));

  const load = useCallback(async (signal: { cancelled: boolean }) => {
    if (!agentId) return;
    setLoading(true);
    setError(false);
    try {
      const result = await actionGetAgent(agentId);
      if (!signal.cancelled) {
        if (!result) setError(true);
        else setAgent(result);
      }
    } catch {
      if (!signal.cancelled) setError(true);
    } finally {
      if (!signal.cancelled) setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    const signal = { cancelled: false };
    setAgent(null);
    setSelected(readSection(appId, agentId));
    if (agentId) {
      void load(signal);
    }
    return () => { signal.cancelled = true; };
  }, [agentId, appId, load]);

  useEffect(() => {
    if (chatsRequested) setSelected(CHATS_SECTION_INDEX);
  }, [chatsRequested, agentId]);

  const chooseSection = (index: number) => {
    setSelected(index);
    if (chatsRequested && index !== CHATS_SECTION_INDEX) {
      const next = new URLSearchParams(searchParams);
      next.delete('section');
      setSearchParams(next, { replace: true });
    }
  };

  useEffect(() => {
    if (lastSelectionContext.current !== selectionContext) {
      lastSelectionContext.current = selectionContext;
      return;
    }
    if (!agentId) return;
    try { sessionStorage.setItem(sectionKey(appId, agentId), String(selected)); }
    catch { /* Section navigation still works without storage. */ }
  }, [agentId, appId, selected, selectionContext]);

  useEffect(() => {
    if (!agentId || selected !== 8) return;
    let cancelled = false;
    setInstances([]);
    setInstancesLoading(true);
    setInstancesError(false);
    Promise.all([httpListAgentBotInstances(agentId), actionLoadOwnedApps()])
      .then(([response]) => { if (!cancelled) setInstances(response.data?.items || []); })
      .catch(() => { if (!cancelled) setInstancesError(true); })
      .finally(() => { if (!cancelled) setInstancesLoading(false); });
    return () => { cancelled = true; };
  }, [agentId, selected]);

  // Panel saves update the shared store. Keep this view fresh without losing
  // enriched fields returned by the full GET.
  useEffect(() => {
    if (!storeAgent) return;
    setAgent((prev) => prev?.id === storeAgent.id ? {
      ...prev, ...storeAgent,
      originAppName: storeAgent.originAppName ?? prev.originAppName,
      botInstancesCount: storeAgent.botInstancesCount ?? prev.botInstancesCount,
    } : prev);
  }, [storeAgent]);

  if (!agentId) return <div className="m-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-600"><p className="font-semibold text-gray-900">{t('configAI.emptyTitle')}</p><p className="mt-1">{t('configAI.selectAgent')}</p></div>;
  if ((agent && agent.id !== agentId) || (!agent && !error)) return <PanelSkeleton label={t('configAI.loading')} />;
  if (error || !agent) return <div role="alert" className="p-4 text-sm text-red-700">{t('configAI.loadFailed')} <button type="button" className="underline" onClick={() => void load({ cancelled: false })}>{t('configAI.retry')}</button></div>;

  const isOwned = !!user?._id && String(agent.ownerId) === String(user._id);
  const readOnly = !isOwned;
  return (
    <div className="config-ai" data-testid="widget-config-ai" aria-busy={loading}>
      {loading && <span role="status" className="sr-only">{t('configAI.loading')}</span>}
      {!readOnly && <WidgetSetupGuide appId={appId} agentId={agent.id} selected={selected} onSelect={chooseSection} />}
      {readOnly && <div className="config-ai-notice" role="status">
        <span><strong>{t('agentSettings.readOnlyTitle')}</strong> {t('configAI.readOnlyDescription')}</span>
        <Link to="/app/admin/agents">{t('aiWidgetActiveAgentSelector.manageAgents')} <span aria-hidden="true">↗</span></Link>
      </div>}
      <TabGroup selectedIndex={selected} onChange={chooseSection}>
        <label className="block text-sm font-medium text-gray-700 lg:hidden">
          {t('configAI.chooseSection')}
          <select className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={selected} onChange={(event) => chooseSection(Number(event.target.value))}>
            {SECTIONS.map((section) => <optgroup key={section.label} label={t(section.label)}>
              {section.tabs.map((key) => <option key={key} value={TABS.indexOf(key)}>{t(key)}</option>)}
            </optgroup>)}
          </select>
        </label>
        <div className="config-ai-layout">
          <TabList className="config-ai-navigation hidden lg:flex" aria-label={t('configAI.chooseSection')}>
            {SECTIONS.map((section) => <div key={section.label} className="config-ai-group">
              <div className="config-ai-group-label">{t(section.label)}</div>
              {section.tabs.map((key) => <Tab key={key} className={({ selected: active }) => classNames('config-ai-tab', active && 'config-ai-tab-active')}>{t(key)}</Tab>)}
            </div>)}
          </TabList>
          <TabPanels className="config-ai-content">
            <div className="config-ai-section-heading">
              <h4 className="text-lg font-semibold text-gray-900">{t(TABS[selected])}</h4>
              <p className="mt-1 text-sm text-gray-600">{t(`configAI.description.${selected}`)}</p>
            </div>
            <TabPanel><div className="config-ai-persona"><PersonaPanel agent={agent} isDisabled={readOnly} /></div></TabPanel>
            <TabPanel><ContextPanel agent={agent} isDisabled={readOnly} /></TabPanel>
            <TabPanel><WebIndexPanel agent={agent} appId={appId} isDisabled={readOnly} /></TabPanel>
            <TabPanel><DocsIndexPanel agent={agent} appId={appId} isDisabled={readOnly} /></TabPanel>
            <TabPanel><SoulMdPanel agent={agent} isDisabled={readOnly} /></TabPanel>
            <TabPanel><HeartbeatPanel agent={agent} isDisabled={readOnly} /></TabPanel>
            <TabPanel><FlowsPanel agent={agent} isDisabled={readOnly} /></TabPanel>
            <TabPanel><TryItPanel agent={agent} /></TabPanel>
            <TabPanel>
              {instancesLoading ? <PanelSkeleton label={t('configAI.loading')} /> : instancesError
                ? <p role="alert">{t('configAI.loadFailed')}</p>
                : <WebsiteWidgetPanel agent={agent} instances={instances} currentAppId={appId} />}
            </TabPanel>
            <TabPanel><ChatsIndexPanel agent={agent} scopedAppId={appId} defaultChatRooms={defaultChatRooms} isDisabled={readOnly} /></TabPanel>
            <TabPanel><VisibilityPanel agent={agent} isOwned={isOwned} isSuperWriteAdmin={!!user?.isSuperAdmin?.write} onChanged={setAgent} /></TabPanel>
          </TabPanels>
        </div>
      </TabGroup>
      <p className="config-ai-footnote">{t('configAI.sharedNotice')}</p>
    </div>
  );
}
