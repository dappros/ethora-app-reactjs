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
// (Was: httpTestMessageAgentBotInstance import for the now-removed agent-header
// Test message modal. The per-room Test buttons live in AgentPanels.tsx.)
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
  'Visibility',
] as const;

const SECTIONS: { label: string; tabs: (typeof TABS[number])[] }[] = [
  { label: 'Identity', tabs: ['Persona', 'Context'] },
  { label: 'Knowledge', tabs: ['Web Index', 'Docs Index'] },
  { label: 'Behaviour', tabs: ['SOUL.MD', 'Heartbeat'] },
  { label: 'Activity', tabs: ['Chats Index'] },
  { label: 'Sharing', tabs: ['Visibility'] },
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

  // (The agent-header "Test message" button moved to per-room buttons inside
  // ChatsIndexPanel so the test always targets one specific room. No top-level
  // modal needed any more.)

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

  // The viewer is read-only here unless they own the agent. The backend
  // already 403s any non-owner PATCH / DELETE / soul.md write, but
  // surfacing this in the UI (disabled inputs, hidden Inspect on per-app
  // bot rows) makes the constraint visible instead of letting the user
  // discover it on save failure. Superadmins can land on this page for
  // private agents owned by other tenants; they are NOT being given an
  // edit affordance here (audit-only).
  const currentUser = useAppStore((s) => s.currentUser);
  const isOwned = !!(agent && currentUser?._id && agent.ownerId === currentUser._id);
  const readOnly = !isOwned;

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
        readOnly={readOnly}
      />

      {readOnly && (
        <div className="mx-4 -mt-2 rounded-md border border-gray-300 bg-gray-50 p-2 text-xs text-gray-700">
          <strong>Read-only.</strong> You're viewing an agent owned by another
          tenant{agent.visibility === 'public' ? ' (public)' : ''}. Editing,
          deleting, and inspecting per-room runtime state are disabled.{' '}
          {agent.visibility === 'public' && (
            <>Use the <em>Clone to my agents</em> action on the Agents list
            page to create your own editable copy.</>
          )}
        </div>
      )}

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
            <PersonaPanel agent={agent} isDisabled={readOnly} />
          </TabPanel>
          <TabPanel className="p-2">
            <ContextPanel agent={agent} isDisabled={readOnly} />
          </TabPanel>
          <TabPanel className="p-2">
            <WebIndexPanel agent={agent} appId={scopedAppId} isDisabled={readOnly} />
          </TabPanel>
          <TabPanel className="p-2">
            <DocsIndexPanel agent={agent} appId={scopedAppId} isDisabled={readOnly} />
          </TabPanel>
          <TabPanel className="p-2">
            <SoulMdPanel agent={agent} isDisabled={readOnly} />
          </TabPanel>
          <TabPanel className="p-2">
            <HeartbeatPanel agent={agent} isDisabled={readOnly} />
          </TabPanel>
          <TabPanel className="p-2">
            <ChatsIndexPanel agent={agent} isDisabled={readOnly} />
          </TabPanel>
          <TabPanel className="p-2">
            <VisibilityPanel
              agent={agent}
              isOwned={isOwned}
              isSuperWriteAdmin={!!currentUser?.isSuperAdmin?.write}
              onChanged={(updated) => setAgent(updated)}
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}

const VisibilityPanel: React.FC<{
  agent: ModelAgent;
  isOwned: boolean;
  isSuperWriteAdmin: boolean;
  onChanged: (a: ModelAgent) => void;
}> = ({ agent, isOwned, isSuperWriteAdmin, onChanged }) => {
  const canEdit = isOwned || isSuperWriteAdmin;
  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <h3 className="text-lg font-semibold mb-1">Visibility</h3>
        <p className="text-sm text-gray-600">
          Controls who can see this agent on this Ethora server.
        </p>
      </div>

      <div className="space-y-2">
        <VisibilityOption
          value="private"
          current={agent.visibility}
          canEdit={canEdit}
          onChange={(v) => doSet(agent.id, v, onChanged)}
          label="Private"
          description="Only you can see this agent. Recommended for agents built for your own business, app, or website."
        />
        <VisibilityOption
          value="unlisted"
          current={agent.visibility}
          canEdit={canEdit}
          onChange={(v) => doSet(agent.id, v, onChanged)}
          label="Unlisted"
          description="Not listed publicly, but discoverable by other tenants who know the agent's address. Useful for sharing with specific partners without making it broadcast-visible."
        />
        <VisibilityOption
          value="public"
          current={agent.visibility}
          canEdit={canEdit}
          onChange={(v) => doSet(agent.id, v, onChanged)}
          label="Public"
          description="Listed for every tenant on this Ethora server. They can view the persona and clone it. Pick this only when the agent is intended to be universally useful (e.g. a generic Support Agent or a published persona for the community)."
        />
      </div>

      {!canEdit && (
        <div className="rounded-md border border-gray-300 bg-gray-50 p-2 text-xs text-gray-700">
          You're viewing an agent owned by another tenant. Only the owner can
          change its visibility.
          {agent.visibility === 'public' && (
            <> Use <em>Clone to my agents</em> on the Agents list to create
            your own editable copy.</>
          )}
        </div>
      )}

      {!isOwned && isSuperWriteAdmin && (
        <div className="rounded-md border border-purple-300 bg-purple-50 p-2 text-xs text-purple-900">
          <strong>Superadmin moderation:</strong> you can flip this agent's
          visibility on behalf of its owner. Use this to take down public
          agents that contain spam, abuse, or otherwise breach platform
          policy. Setting <em>Private</em> immediately removes it from every
          other tenant's <em>Public agents</em> list. Owner-facing
          notifications are not sent — coordinate out-of-band when
          appropriate.
        </div>
      )}
    </div>
  );
};

async function doSet(
  agentId: string,
  v: 'private' | 'unlisted' | 'public',
  onChanged: (a: ModelAgent) => void
) {
  try {
    const updated = await actionSetAgentVisibility(agentId, v);
    if (updated) onChanged(updated);
    toast.success(`Visibility set to ${v}`);
  } catch (err: any) {
    toast.error(`Failed: ${err?.response?.data?.error || err.message}`);
  }
}

const VisibilityOption: React.FC<{
  value: 'private' | 'unlisted' | 'public';
  current: string;
  canEdit: boolean;
  onChange: (v: 'private' | 'unlisted' | 'public') => void;
  label: string;
  description: string;
}> = ({ value, current, canEdit, onChange, label, description }) => {
  const isChecked = current === value;
  return (
    <label className={classNames(
      'flex items-start gap-3 border rounded-lg p-3 cursor-pointer',
      isChecked ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white',
      !canEdit && 'cursor-not-allowed opacity-70'
    )}>
      <input
        type="radio"
        name="visibility"
        value={value}
        checked={isChecked}
        disabled={!canEdit}
        onChange={() => onChange(value)}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-gray-600">{description}</div>
      </div>
    </label>
  );
};

const Header: React.FC<{
  agent: ModelAgent;
  defaultBotInstance: (ModelBotInstance & { appName?: string }) | null;
  onBack: () => void;
  onVisibilityChanged: (a: ModelAgent) => void;
  onInstancesChanged: () => void;
  readOnly: boolean;
}> = ({ agent, defaultBotInstance, onBack, onInstancesChanged, readOnly }) => {
  // The visibility selector moved out of the header into its own
  // "Visibility" tab (see VisibilityPanel below). Header is now identity
  // + the per-app Start/Stop affordance, gated on ownership.
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
        {!readOnly && defaultBotInstance && (
          <button
            onClick={async () => {
              const next = defaultBotInstance.status === 'on' ? 'off' : 'on';
              try {
                await actionSetBotInstanceStatus(defaultBotInstance.id, next);
                toast.success(`Bot ${next}`);
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

// (Was: TestMessageModal opened from the agent header. Replaced by per-room [Test]
// buttons inside ChatsIndexPanel - one click sends a system message into one
// specific room, no modal needed.)
