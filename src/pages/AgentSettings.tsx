// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// AgentSettings: per-Agent edit page reachable from the global Agents area.
// Mirrors the per-App AppSettings layout: tabs in a left sidebar (grouped by section),
// active tab content on the right. Reuses the shared AgentPanels components so logic
// stays in one place.
//
// Route: /app/admin/agents/:agentId/settings?tab=Persona|Context|Web+Index|...

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  actionGetAgent,
  actionListAgents,
  actionSetAgentVisibility,
  actionSetBotInstanceStatus,
} from '../actions';
import { httpTestMessageAgentBotInstance } from '../http';
import {
  ChatsIndexPanel,
  ContextPanel,
  DocsIndexPanel,
  HeartbeatPanel,
  PersonaPanel,
  SoulMdPanel,
  WebIndexPanel,
} from '../components/Agents/panels/AgentPanels';
import { httpListAgentBotInstances } from '../http';
import { ModelAgent, ModelBotInstance } from '../models';
import { useAppStore } from '../store/useAppStore';

// (TestMessageModal is defined below.)

// Keep the tab list flat (single source of truth for tab order, panel content, and URL).
const TABS = [
  'Persona',
  'Context',
  'Web Index',
  'Docs Index',
  'SOUL.MD',
  'Heartbeat',
  'Chats Index',
] as const;

const SECTIONS: { label: string; tabs: (typeof TABS[number])[] }[] = [
  { label: 'Identity', tabs: ['Persona', 'Context'] },
  { label: 'Knowledge', tabs: ['Web Index', 'Docs Index'] },
  { label: 'Behaviour', tabs: ['SOUL.MD', 'Heartbeat'] },
  { label: 'Activity', tabs: ['Chats Index'] },
];

export default function AgentSettings() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = searchParams.get('tab');
  const initialTabIndex = TABS.includes(tabFromUrl as any) ? TABS.indexOf(tabFromUrl as any) : 0;
  const [selectedIndex, setSelectedIndex] = useState(initialTabIndex);
  const [agent, setAgent] = useState<ModelAgent | null>(null);
  const [instances, setInstances] = useState<(ModelBotInstance & { appName?: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const apps = useAppStore((s) => s.apps);

  // Re-fetchable so the header Start/Stop and the Test message modal can refresh
  // the displayed status without forcing a full page reload.
  const reloadInstances = useCallback(async () => {
    if (!agentId) return;
    try {
      const r = await httpListAgentBotInstances(agentId);
      setInstances(r.data?.items || []);
    } catch {
      // ignore - already toasted in the action
    }
  }, [agentId]);

  useEffect(() => {
    if (!agentId) return;
    setLoading(true);
    actionGetAgent(agentId)
      .then((a) => setAgent(a))
      .catch((e) => toast.error(`Failed to load agent: ${e?.response?.data?.error || e.message}`))
      .finally(() => setLoading(false));
    reloadInstances();
    // Load the user's apps so the Web/Docs Index panels can resolve their scoped App.
    actionListAgents({ visibility: 'mine' }).catch(() => {});
  }, [agentId, reloadInstances]);

  // Test message modal state lives at the top level so the header button can open it.
  const [testMsgOpen, setTestMsgOpen] = useState(false);

  useEffect(() => {
    if (TABS.includes(tabFromUrl as any) && TABS.indexOf(tabFromUrl as any) !== selectedIndex) {
      setSelectedIndex(TABS.indexOf(tabFromUrl as any));
    }
  }, [tabFromUrl]);

  const handleTabChange = (index: number) => {
    if (TABS[index] !== tabFromUrl) {
      setSearchParams({ tab: TABS[index] }, { replace: true });
    }
    setSelectedIndex(index);
  };

  // Pick a sensible scope App for source ingestion. Prefer the agent's origin App if the
  // user still owns it; otherwise fall back to the first App where this agent has a
  // BotInstance; otherwise leave blank (panels show a soft warning).
  const scopedAppId = useMemo(() => {
    if (!agent) return '';
    const ownsOrigin = !!agent.originAppId && apps.some((a) => a._id === agent.originAppId);
    if (ownsOrigin) return agent.originAppId as string;
    return instances[0]?.appId || '';
  }, [agent, apps, instances]);

  const defaultBotInstance = instances[0] || null;

  if (loading && !agent) return <div className="p-4 text-gray-500">Loading agent...</div>;
  if (!agent) return <div className="p-4 text-gray-500">Agent not found.</div>;

  return (
    <div className="h-full grid grid-rows-[auto,1fr] gap-y-4">
      <Header
        agent={agent}
        defaultBotInstance={defaultBotInstance}
        onBack={() => navigate('/app/admin/agents')}
        onVisibilityChanged={(updated) => setAgent(updated)}
        onInstancesChanged={reloadInstances}
        onTestMessage={() => setTestMsgOpen(true)}
      />

      <TabGroup
        className="grid h-full overflow-hidden grid-rows-[46px,1fr] gap-y-4 lg:grid-rows-1 lg:grid-cols-[260px,1fr] px-4"
        selectedIndex={selectedIndex}
        onChange={handleTabChange}
      >
        <TabList className="flex flex-row lg:flex-col hide-scroll lg:mb-0 border-b border-gray-200 lg:border-b-0 lg:pr-4 overflow-auto lg:border-r lg:border-gray-200">
          <SidebarSections selectedIndex={selectedIndex} />
        </TabList>

        <TabPanels className="h-full overflow-y-auto px-2">
          <TabPanel className="p-2">
            <PersonaPanel agent={agent} />
          </TabPanel>
          <TabPanel className="p-2">
            <ContextPanel agent={agent} />
          </TabPanel>
          <TabPanel className="p-2">
            <WebIndexPanel agent={agent} appId={scopedAppId} />
          </TabPanel>
          <TabPanel className="p-2">
            <DocsIndexPanel agent={agent} appId={scopedAppId} />
          </TabPanel>
          <TabPanel className="p-2">
            <SoulMdPanel agent={agent} />
          </TabPanel>
          <TabPanel className="p-2">
            <HeartbeatPanel agent={agent} />
          </TabPanel>
          <TabPanel className="p-2">
            <ChatsIndexPanel agent={agent} />
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {testMsgOpen && (
        <TestMessageModal
          agent={agent}
          instances={instances}
          onClose={() => setTestMsgOpen(false)}
        />
      )}
    </div>
  );
}

const Header: React.FC<{
  agent: ModelAgent;
  defaultBotInstance: (ModelBotInstance & { appName?: string }) | null;
  onBack: () => void;
  onVisibilityChanged: (a: ModelAgent) => void;
  onInstancesChanged: () => void;
  onTestMessage?: () => void;
}> = ({ agent, defaultBotInstance, onBack, onVisibilityChanged, onInstancesChanged, onTestMessage }) => {
  return (
    <div className="px-4 pt-2 flex flex-wrap items-center gap-3 border-b border-gray-200 pb-3">
      <button onClick={onBack} className="text-sm text-brand-500 hover:underline">
        &larr; Agents
      </button>
      <div className="flex items-center gap-2 flex-1 min-w-[240px]">
        {agent.avatarUrl ? (
          <img src={agent.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
            {(agent.displayName || 'AI').slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold truncate">{agent.displayName || 'AI Bot'}</div>
          <div className="text-[10px] text-gray-500 break-all">{agent.address}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={agent.visibility}
          onChange={async (e) => {
            try {
              const updated = await actionSetAgentVisibility(agent.id, e.target.value as any);
              if (updated) onVisibilityChanged(updated);
              toast.success(`Visibility set to ${e.target.value}`);
            } catch (err: any) {
              toast.error(`Failed: ${err?.response?.data?.error || err.message}`);
            }
          }}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="private">Private</option>
          <option value="unlisted">Unlisted</option>
          <option value="public">Public</option>
        </select>

        {onTestMessage && (
          <button
            onClick={onTestMessage}
            className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
            title="Send a test message into every room this Agent is currently in"
          >
            Test message
          </button>
        )}

        {defaultBotInstance && (
          <button
            onClick={async () => {
              const next = defaultBotInstance.status === 'on' ? 'off' : 'on';
              try {
                await actionSetBotInstanceStatus(defaultBotInstance.id, next);
                toast.success(`Bot ${next}`);
                // Trigger re-fetch of bot instances so the button label flips
                // immediately instead of requiring a page reload.
                onInstancesChanged();
              } catch (e: any) {
                toast.error(`Failed: ${e?.response?.data?.error || e.message}`);
              }
            }}
            className={classNames(
              'rounded px-3 py-1 text-sm text-white',
              defaultBotInstance.status === 'on'
                ? 'bg-red-500 hover:bg-red-400'
                : 'bg-green-500 hover:bg-green-400'
            )}
            title={`Toggle status of this Agent's BotInstance in app "${defaultBotInstance.appName || defaultBotInstance.appId}"`}
          >
            {defaultBotInstance.status === 'on' ? 'Stop' : 'Start'}
          </button>
        )}
      </div>
    </div>
  );
};

const SidebarSections: React.FC<{ selectedIndex: number }> = ({ selectedIndex: _ignored }) => {
  // Render section labels + Tabs. Each Tab is a Headless-UI Tab inside the parent TabList.
  // Headless UI tracks Tab DOM order to map them to TabPanels, so we render them in the
  // same flat order as the TABS constant — sections are visual grouping only.
  return (
    <div className="flex flex-row lg:flex-col gap-1 lg:gap-3 lg:p-2 w-full">
      {SECTIONS.map((section) => (
        <div key={section.label} className="flex flex-row lg:flex-col gap-1">
          <div className="hidden lg:block text-[11px] uppercase font-semibold text-gray-400 px-2 mt-2">
            {section.label}
          </div>
          {section.tabs.map((label) => (
            <Tab
              key={label}
              className={({ selected }) =>
                classNames(
                  'text-left px-3 py-2 rounded text-sm whitespace-nowrap focus:outline-none',
                  selected ? 'bg-brand-50 text-brand-500 font-semibold' : 'text-gray-700 hover:bg-gray-100'
                )
              }
            >
              {label}
            </Tab>
          ))}
        </div>
      ))}
    </div>
  );
};

// "Test message" modal opened from the agent header. Lets the operator pick a target
// BotInstance (when the agent is deployed to multiple Apps) and send a system message
// into every room that BotInstance is in. Returned per-room result is rendered as a
// quick confirmation table - this is the "is the bot reachable?" smoke test.
const TestMessageModal: React.FC<{
  agent: ModelAgent;
  instances: (ModelBotInstance & { appName?: string })[];
  onClose: () => void;
}> = ({ agent, instances, onClose }) => {
  const onlyOne = instances.length === 1;
  const [selected, setSelected] = useState<string>(instances[0]?.id || '');
  const [text, setText] = useState<string>(
    `(test message from ${agent.displayName || 'agent'})`
  );
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<null | {
    ok: boolean;
    sent?: number;
    total?: number;
    results?: Array<{ room: string; ok: boolean; error?: string }>;
    message?: string;
    code?: string;
  }>(null);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-[560px] max-w-[95%] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Send test message</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black">&times;</button>
        </div>
        <p className="text-xs text-gray-500">
          Sends a system message into every room this BotInstance is currently in.
          Verifies that the bot is genuinely connected and able to deliver stanzas.
        </p>

        {!onlyOne && instances.length > 0 && (
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">Deployed in app</span>
            <select
              className="border rounded px-2 py-1 w-full text-sm"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {instances.map((bi) => (
                <option key={bi.id} value={bi.id}>
                  {bi.appName || '(unknown app)'} — {bi.status}
                </option>
              ))}
            </select>
          </label>
        )}

        {instances.length === 0 && (
          <div className="text-sm text-amber-600">
            This agent is not deployed in any app yet. Invite it into a chat first.
          </div>
        )}

        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 mb-1">Message</span>
          <textarea
            className="border rounded px-2 py-1 w-full"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>

        {result && (
          <div className={classNames('rounded p-2 text-xs', result.ok ? 'bg-green-50' : 'bg-red-50')}>
            {result.ok ? (
              <>
                Sent to <b>{result.sent}/{result.total}</b> room(s).
                {result.results && result.results.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {result.results.map((r) => (
                      <li key={r.room} className={r.ok ? 'text-green-700' : 'text-red-700'}>
                        {r.ok ? '✓' : '✗'} <span className="font-mono break-all">{r.room}</span>
                        {r.error && <> — {r.error}</>}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <>
                <div><b>Failed:</b> {result.message || '(no detail)'}</div>
                {result.code && <div className="text-gray-500">Code: {result.code}</div>}
                {result.code === 'BOT_NOT_SPAWNED' && (
                  <div className="mt-1 text-gray-700">
                    Toggle Stop/Start on this agent to re-spawn it in ai-service.
                  </div>
                )}
                {result.code === 'BOT_NO_ROOMS' && (
                  <div className="mt-1 text-gray-700">
                    Re-invite the bot via "Add Bot" on the chat row, or Stop/Start to replay joinedRooms.
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="border rounded px-4 py-2 hover:bg-gray-100">Close</button>
          <button
            disabled={busy || !selected}
            onClick={async () => {
              setBusy(true);
              setResult(null);
              try {
                const r = await httpTestMessageAgentBotInstance(agent.id, selected, text);
                setResult({ ok: true, sent: r.data?.sent, total: r.data?.total, results: r.data?.results });
              } catch (e: any) {
                const data = e?.response?.data;
                setResult({ ok: false, message: data?.message || data?.error || e.message, code: data?.code });
              } finally {
                setBusy(false);
              }
            }}
            className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {busy ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};
