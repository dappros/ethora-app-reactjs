// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Phase 1 (Agents): new "AI Bots" page under System group of admin App settings.
// Lists every Agent owned by this App (via BotInstances) plus public agents discoverable
// from the rest of the server. Per-Agent inner tabs: Persona, Context, Web Index,
// Docs Index, SOUL.MD, Heartbeat, Chats Index. Web/Docs Index tabs reuse the same
// HTTP endpoints as the legacy AI Widget but pass the agentId so docs land in the
// per-Agent RAG namespace.

import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/react';
import classNames from 'classnames';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  actionCloneAgent,
  actionCreateAgent,
  actionDeleteAgent,
  actionInviteAgentToChat,
  actionListAgents,
  actionListBotInstances,
  actionSetAgentVisibility,
  actionSetBotInstanceStatus,
  actionUpdateAgent,
  actionUpdateAgentSoul,
} from '../../actions';
import {
  ModelAgent,
  ModelApp,
  ModelAppDefaulRooom,
  ModelBotInstance,
} from '../../models';
import { useAppStore } from '../../store/useAppStore';
import {
  httpAgentDocsUpload,
  httpAgentSiteCrawl,
  httpUpdateApp,
} from '../../http';
import { agentPromptTemplates } from '../../constants/agentPromptTemplates';

// Simple inline styles match the rest of the AppSettings pages: tailwind utility classes
// + a few raw element classes from existing components. Shadcn/MUI mix is the existing
// repo convention; we don't add a new dependency here.

interface AIBotsProps {
  appId: string;
  app: ModelApp;
  isDisabled?: boolean;
  defaultChatRooms?: ModelAppDefaulRooom[];
}

const INNER_TABS = ['Persona', 'Context', 'Web Index', 'Docs Index', 'SOUL.MD', 'Heartbeat', 'Chats Index'] as const;

function emptyDraft(): Partial<ModelAgent> {
  return {
    displayName: 'New AI Agent',
    avatarUrl: '',
    bio: '',
    prompt: 'You are a helpful assistant.',
    responseMode: 'smart',
    responseProbability: 1,
    cooldownSec: 0,
    isRAG: true,
    soulMd: '',
    visibility: 'private',
    heartbeat: { enabled: false, schedule: '', prompt: '' },
  };
}

export const AIBots: React.FC<AIBotsProps> = ({ appId, app, isDisabled, defaultChatRooms }) => {
  const agents = useAppStore((s) => s.agents);
  const botInstances = useAppStore((s) => s.botInstances);
  const selectedAgentId = useAppStore((s) => s.selectedAgentId);
  const doSelectAgent = useAppStore((s) => s.doSelectAgent);

  const [loading, setLoading] = useState(false);
  const [innerTab, setInnerTab] = useState<number>(0);
  const [showCreate, setShowCreate] = useState(false);
  const [createDraft, setCreateDraft] = useState<Partial<ModelAgent>>(emptyDraft());
  const [browsePublic, setBrowsePublic] = useState(false);

  // Initial load: fetch this app's agents + bot instances.
  useEffect(() => {
    if (!appId) return;
    setLoading(true);
    Promise.all([
      actionListAgents({ visibility: 'mine' }),
      actionListBotInstances({ appId }),
    ])
      .catch((e) => {
        console.error('failed to load agents', e);
        toast.error('Failed to load agents');
      })
      .finally(() => setLoading(false));
  }, [appId]);

  // Auto-select first agent if none selected.
  useEffect(() => {
    if (!selectedAgentId && agents.length > 0) {
      doSelectAgent(agents[0].id);
    }
  }, [agents, selectedAgentId, doSelectAgent]);

  const selectedAgent = useMemo(() => agents.find((a) => a.id === selectedAgentId) || null, [agents, selectedAgentId]);
  const selectedBotInstance = useMemo(
    () => botInstances.find((bi) => bi.agentId === selectedAgentId) || null,
    [botInstances, selectedAgentId]
  );

  async function handleCreate() {
    try {
      const created = await actionCreateAgent({ ...createDraft, ownerAppId: appId });
      setShowCreate(false);
      setCreateDraft(emptyDraft());
      toast.success(`Agent "${created.displayName}" created (${created.address.slice(0, 10)}...)`);
    } catch (e: any) {
      toast.error(`Create failed: ${e?.response?.data?.error || e.message}`);
    }
  }

  async function handleSetDefault(agent: ModelAgent) {
    // Setting an Agent as the App's "AI Widget" default requires creating/finding a
    // BotInstance for it in this app. Easiest: invite to the existing AI Widget chat.
    // Then write App.defaultBotInstanceId via the legacy v2/bot endpoint.
    const widgetChatId = app.aiBot?.chatId;
    if (!widgetChatId) {
      toast.warn('Bind a chat to AI Widget first (Web App > Web tab)');
      return;
    }
    try {
      const out = await actionInviteAgentToChat(agent.id, { appId, chatId: widgetChatId });
      const bi = out?.respData?.botInstance || out?.botInstance;
      if (bi?.id) {
        await httpUpdateApp(appId, { defaultBotInstanceId: bi.id });
        toast.success(`Agent "${agent.displayName}" set as default for AI Widget`);
        await actionListBotInstances({ appId });
      }
    } catch (e: any) {
      toast.error(`Set default failed: ${e?.response?.data?.error || e.message}`);
    }
  }

  return (
    <div className="overflow-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-varela">AI Bots (Agents)</h2>
        <div className="flex gap-2">
          <button
            disabled={isDisabled}
            onClick={() => setShowCreate(true)}
            className="bg-brand-500 hover:bg-brand-400 text-white rounded-xl px-4 py-2 disabled:opacity-50"
          >
            + New Agent
          </button>
          <button
            onClick={() => setBrowsePublic(true)}
            className="border border-gray-300 hover:bg-gray-100 rounded-xl px-4 py-2"
          >
            Browse public
          </button>
        </div>
      </div>

      {/* Agent picker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {agents.length === 0 && !loading && (
          <div className="col-span-full p-4 border rounded-xl text-gray-500">
            No agents yet. Click "+ New Agent" to create one.
          </div>
        )}
        {agents.map((a) => (
          <button
            key={a.id}
            onClick={() => doSelectAgent(a.id)}
            className={classNames(
              'p-3 border rounded-xl text-left hover:border-brand-500',
              selectedAgentId === a.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
            )}
          >
            <div className="flex items-center gap-2">
              {a.avatarUrl ? (
                <img src={a.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  {a.displayName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{a.displayName}</div>
                <div className="text-xs text-gray-500 truncate">{a.address}</div>
              </div>
              <span
                className={classNames(
                  'text-[10px] px-2 py-0.5 rounded',
                  a.visibility === 'public'
                    ? 'bg-green-100 text-green-700'
                    : a.visibility === 'unlisted'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {a.visibility}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Selected agent detail */}
      {selectedAgent && (
        <SelectedAgentEditor
          agent={selectedAgent}
          botInstance={selectedBotInstance}
          appId={appId}
          isDisabled={isDisabled}
          innerTab={innerTab}
          setInnerTab={setInnerTab}
          onSetDefault={() => handleSetDefault(selectedAgent)}
          defaultChatRooms={defaultChatRooms || []}
        />
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateAgentModal
          draft={createDraft}
          setDraft={setCreateDraft}
          onCancel={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Public browse modal */}
      {browsePublic && (
        <BrowsePublicModal
          appId={appId}
          onClose={() => setBrowsePublic(false)}
          onCloned={() => actionListAgents({ visibility: 'mine' })}
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// SelectedAgentEditor: header (status/visibility/RAG/model) + 7 inner tabs.
// ---------------------------------------------------------------------------

const SelectedAgentEditor: React.FC<{
  agent: ModelAgent;
  botInstance: ModelBotInstance | null;
  appId: string;
  isDisabled?: boolean;
  innerTab: number;
  setInnerTab: (n: number) => void;
  onSetDefault: () => void;
  defaultChatRooms: ModelAppDefaulRooom[];
}> = ({ agent, botInstance, appId, isDisabled, innerTab, setInnerTab, onSetDefault, defaultChatRooms }) => {
  return (
    <div className="border rounded-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-200">
        <div className="flex-1 min-w-[200px]">
          <div className="text-lg font-semibold">{agent.displayName}</div>
          <div className="text-xs text-gray-500 break-all">Address: {agent.address}</div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            disabled={isDisabled}
            value={agent.visibility}
            onChange={async (e) => {
              try {
                await actionSetAgentVisibility(agent.id, e.target.value as any);
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

          {botInstance && (
            <button
              onClick={async () => {
                try {
                  const next = botInstance.status === 'on' ? 'off' : 'on';
                  await actionSetBotInstanceStatus(botInstance.id, next);
                  await actionListBotInstances({ appId });
                  toast.success(`Bot ${next}`);
                } catch (err: any) {
                  toast.error(`Failed: ${err?.response?.data?.error || err.message}`);
                }
              }}
              className={classNames(
                'rounded px-3 py-1 text-sm text-white',
                botInstance.status === 'on' ? 'bg-red-500 hover:bg-red-400' : 'bg-green-500 hover:bg-green-400'
              )}
            >
              {botInstance.status === 'on' ? 'Stop' : 'Start'}
            </button>
          )}

          <button
            onClick={onSetDefault}
            className="border rounded px-3 py-1 text-sm hover:bg-gray-100"
            title="Use this agent as the AI Widget responder"
          >
            Set as Widget default
          </button>

          <button
            onClick={async () => {
              if (!confirm(`Delete agent "${agent.displayName}"? This will disable all its BotInstances.`)) return;
              try {
                await actionDeleteAgent(agent.id);
                toast.success('Agent deleted');
              } catch (err: any) {
                toast.error(`Failed: ${err?.response?.data?.error || err.message}`);
              }
            }}
            className="text-red-500 hover:underline text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Inner tabs */}
      <TabGroup selectedIndex={innerTab} onChange={setInnerTab}>
        <TabList className="flex flex-wrap gap-1 px-4 pt-3 border-b border-gray-200">
          {INNER_TABS.map((label) => (
            <Tab
              key={label}
              className={({ selected }) =>
                classNames(
                  'px-3 py-2 text-sm rounded-t border-b-2',
                  selected ? 'border-brand-500 text-brand-500 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-800'
                )
              }
            >
              {label}
            </Tab>
          ))}
        </TabList>

        <TabPanels className="p-4">
          <TabPanel>
            <PersonaPanel agent={agent} isDisabled={isDisabled} />
          </TabPanel>
          <TabPanel>
            <ContextPanel agent={agent} isDisabled={isDisabled} />
          </TabPanel>
          <TabPanel>
            <WebIndexPanel agent={agent} appId={appId} isDisabled={isDisabled} />
          </TabPanel>
          <TabPanel>
            <DocsIndexPanel agent={agent} appId={appId} isDisabled={isDisabled} />
          </TabPanel>
          <TabPanel>
            <SoulMdPanel agent={agent} isDisabled={isDisabled} />
          </TabPanel>
          <TabPanel>
            <HeartbeatPanel agent={agent} isDisabled={isDisabled} />
          </TabPanel>
          <TabPanel>
            <ChatsIndexPanel
              agent={agent}
              botInstance={botInstance}
              appId={appId}
              defaultChatRooms={defaultChatRooms}
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tab panels: each is small + self-contained.
// ---------------------------------------------------------------------------

const PersonaPanel: React.FC<{ agent: ModelAgent; isDisabled?: boolean }> = ({ agent, isDisabled }) => {
  const [displayName, setDisplayName] = useState(agent.displayName);
  const [avatarUrl, setAvatarUrl] = useState(agent.avatarUrl);
  const [bio, setBio] = useState(agent.bio);
  const [responseMode, setResponseMode] = useState(agent.responseMode);
  const [responseProbability, setResponseProbability] = useState(agent.responseProbability);
  const [cooldownSec, setCooldownSec] = useState(agent.cooldownSec);

  useEffect(() => {
    setDisplayName(agent.displayName);
    setAvatarUrl(agent.avatarUrl);
    setBio(agent.bio);
    setResponseMode(agent.responseMode);
    setResponseProbability(agent.responseProbability);
    setCooldownSec(agent.cooldownSec);
  }, [agent.id]);

  async function save() {
    try {
      await actionUpdateAgent(agent.id, {
        displayName,
        avatarUrl,
        bio,
        responseMode,
        responseProbability,
        cooldownSec,
      });
      toast.success('Saved');
    } catch (e: any) {
      toast.error(`Save failed: ${e?.response?.data?.error || e.message}`);
    }
  }

  return (
    <div className="space-y-3 max-w-2xl">
      <Field label="Display name">
        <input className="border rounded px-2 py-1 w-full" disabled={isDisabled} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </Field>
      <Field label="Avatar URL">
        <input className="border rounded px-2 py-1 w-full" disabled={isDisabled} value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
      </Field>
      <Field label="Bio">
        <textarea className="border rounded px-2 py-1 w-full" rows={3} disabled={isDisabled} value={bio} onChange={(e) => setBio(e.target.value)} />
      </Field>
      <Field label="Response mode">
        <select className="border rounded px-2 py-1" disabled={isDisabled} value={responseMode} onChange={(e) => setResponseMode(e.target.value as any)}>
          <option value="always">Always</option>
          <option value="mentioned">Mentioned only</option>
          <option value="smart">Smart (LLM gate)</option>
          <option value="probability">Probability</option>
        </select>
      </Field>
      {responseMode === 'probability' && (
        <Field label={`Probability (${(responseProbability * 100).toFixed(0)}%)`}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            disabled={isDisabled}
            value={responseProbability}
            onChange={(e) => setResponseProbability(parseFloat(e.target.value))}
          />
        </Field>
      )}
      <Field label="Cooldown (seconds between replies in the same room)">
        <input type="number" min={0} className="border rounded px-2 py-1 w-32" disabled={isDisabled} value={cooldownSec} onChange={(e) => setCooldownSec(parseInt(e.target.value || '0', 10))} />
      </Field>
      <button onClick={save} disabled={isDisabled} className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 disabled:opacity-50">
        Save persona
      </button>
    </div>
  );
};

const ContextPanel: React.FC<{ agent: ModelAgent; isDisabled?: boolean }> = ({ agent, isDisabled }) => {
  const [prompt, setPrompt] = useState(agent.prompt);
  useEffect(() => setPrompt(agent.prompt), [agent.id]);

  return (
    <div className="space-y-3 max-w-3xl">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Templates:</span>
        {agentPromptTemplates.map((t) => (
          <button
            key={t.id}
            disabled={isDisabled}
            onClick={() => setPrompt(t.prompt)}
            className="text-xs border rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-50"
          >
            {t.label}
          </button>
        ))}
      </div>
      <textarea
        className="border rounded px-2 py-2 w-full font-mono text-sm"
        rows={14}
        disabled={isDisabled}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={async () => {
          try {
            await actionUpdateAgent(agent.id, { prompt });
            toast.success('Context saved');
          } catch (e: any) {
            toast.error(`Save failed: ${e?.response?.data?.error || e.message}`);
          }
        }}
        disabled={isDisabled}
        className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        Save context
      </button>
    </div>
  );
};

const WebIndexPanel: React.FC<{ agent: ModelAgent; appId: string; isDisabled?: boolean }> = ({ agent, appId, isDisabled }) => {
  const [url, setUrl] = useState('');
  const [followLink, setFollowLink] = useState(true);
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-3 max-w-2xl">
      <div className="text-sm text-gray-600">
        Crawl a website and store content as embeddings under this agent's RAG namespace.
      </div>
      <div className="flex gap-2">
        <input className="border rounded px-2 py-1 flex-1" disabled={isDisabled || busy} placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" disabled={isDisabled || busy} checked={followLink} onChange={(e) => setFollowLink(e.target.checked)} />
          follow links
        </label>
        <button
          disabled={isDisabled || busy || !url}
          onClick={async () => {
            setBusy(true);
            try {
              await httpAgentSiteCrawl(appId, agent.id, url, followLink);
              toast.success('Crawl queued');
              setUrl('');
            } catch (e: any) {
              toast.error(`Crawl failed: ${e?.response?.data?.error || e.message}`);
            } finally {
              setBusy(false);
            }
          }}
          className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {busy ? 'Crawling...' : 'Crawl'}
        </button>
      </div>
      <div className="text-xs text-gray-500">
        Indexed bytes: {agent.totalSiteSourceSize?.toLocaleString() || 0}
      </div>
    </div>
  );
};

const DocsIndexPanel: React.FC<{ agent: ModelAgent; appId: string; isDisabled?: boolean }> = ({ agent, appId, isDisabled }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-3 max-w-2xl">
      <div className="text-sm text-gray-600">Upload PDFs, DOCX, MD, TXT to index under this agent.</div>
      <input
        ref={fileRef}
        type="file"
        multiple
        disabled={isDisabled || busy}
        onChange={async (e: ChangeEvent<HTMLInputElement>) => {
          const files = Array.from(e.target.files || []);
          if (!files.length) return;
          setBusy(true);
          try {
            await httpAgentDocsUpload(appId, agent.id, files);
            toast.success(`Uploaded ${files.length} file(s)`);
          } catch (err: any) {
            toast.error(`Upload failed: ${err?.response?.data?.error || err.message}`);
          } finally {
            setBusy(false);
            if (fileRef.current) fileRef.current.value = '';
          }
        }}
      />
      {busy && <div className="text-sm text-gray-500">Uploading + parsing + embedding...</div>}
    </div>
  );
};

const SoulMdPanel: React.FC<{ agent: ModelAgent; isDisabled?: boolean }> = ({ agent, isDisabled }) => {
  const [soul, setSoul] = useState(agent.soulMd);
  useEffect(() => setSoul(agent.soulMd), [agent.id]);
  return (
    <div className="space-y-3 max-w-3xl">
      <div className="text-sm text-gray-600">
        SOUL.MD: the agent's evolving identity. The agent itself can request updates (Phase 2 wires
        a tool-call); for now you can edit it as the operator. Last update: {agent.soulMdUpdatedAt || 'never'} ({agent.soulMdUpdatedBy || 'n/a'})
      </div>
      <textarea className="border rounded px-2 py-2 w-full font-mono text-sm" rows={16} disabled={isDisabled} value={soul} onChange={(e) => setSoul(e.target.value)} />
      <div className="flex gap-2">
        <button
          onClick={async () => {
            try {
              await actionUpdateAgentSoul(agent.id, { soulMd: soul });
              toast.success('SOUL.MD saved');
            } catch (e: any) {
              toast.error(`Failed: ${e?.response?.data?.error || e.message}`);
            }
          }}
          disabled={isDisabled}
          className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          Save SOUL.MD
        </button>
      </div>
    </div>
  );
};

const HeartbeatPanel: React.FC<{ agent: ModelAgent; isDisabled?: boolean }> = ({ agent, isDisabled }) => {
  const [enabled, setEnabled] = useState(agent.heartbeat?.enabled || false);
  const [schedule, setSchedule] = useState(agent.heartbeat?.schedule || '');
  const [hbPrompt, setHbPrompt] = useState(agent.heartbeat?.prompt || '');
  useEffect(() => {
    setEnabled(agent.heartbeat?.enabled || false);
    setSchedule(agent.heartbeat?.schedule || '');
    setHbPrompt(agent.heartbeat?.prompt || '');
  }, [agent.id]);

  return (
    <div className="space-y-3 max-w-2xl">
      <div className="text-sm text-gray-600">
        Heartbeat lets the agent engage proactively (e.g. once per day, after N min of inactivity, on a cron).
        Phase 1 stores the config; the cron worker that actually fires events is delivered in Phase 2.
      </div>
      <Field label="Enabled">
        <input type="checkbox" disabled={isDisabled} checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
      </Field>
      <Field label="Schedule (cron, interval, or keyword)">
        <input className="border rounded px-2 py-1 w-full" disabled={isDisabled} placeholder="e.g. '0 9 * * MON-FRI' or 'inactive 1h'" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
      </Field>
      <Field label="Heartbeat prompt">
        <textarea className="border rounded px-2 py-1 w-full" rows={5} disabled={isDisabled} value={hbPrompt} onChange={(e) => setHbPrompt(e.target.value)} />
      </Field>
      <button
        onClick={async () => {
          try {
            await actionUpdateAgent(agent.id, { heartbeat: { enabled, schedule, prompt: hbPrompt } });
            toast.success('Heartbeat saved');
          } catch (e: any) {
            toast.error(`Failed: ${e?.response?.data?.error || e.message}`);
          }
        }}
        disabled={isDisabled}
        className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        Save heartbeat
      </button>
    </div>
  );
};

const ChatsIndexPanel: React.FC<{
  agent: ModelAgent;
  botInstance: ModelBotInstance | null;
  appId: string;
  defaultChatRooms: ModelAppDefaulRooom[];
}> = ({ agent, botInstance, appId, defaultChatRooms }) => {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        Rooms this agent's BotInstance has joined in this App. Phase 2 will surface deep history retrieval here.
      </div>
      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="text-left p-2">Room JID</th><th className="text-left p-2">Last active</th></tr>
          </thead>
          <tbody>
            {(botInstance?.joinedRooms || []).length === 0 && (
              <tr><td colSpan={2} className="p-3 text-gray-500">Not in any room yet.</td></tr>
            )}
            {(botInstance?.joinedRooms || []).map((r) => (
              <tr key={r} className="border-t"><td className="p-2 font-mono text-xs">{r}</td><td className="p-2 text-gray-500">{botInstance?.lastActiveAt || ''}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick-invite a default room */}
      <div className="border rounded p-3 bg-gray-50">
        <div className="text-sm font-semibold mb-2">Invite to a default room</div>
        <div className="flex flex-col gap-2">
          {defaultChatRooms.map((r) => (
            <button
              key={r.chatId}
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await actionInviteAgentToChat(agent.id, { appId, chatId: r.chatId });
                  toast.success(`Invited to ${r.title}`);
                  await actionListBotInstances({ appId });
                } catch (e: any) {
                  toast.error(`Invite failed: ${e?.response?.data?.error || e.message}`);
                } finally {
                  setBusy(false);
                }
              }}
              className="text-left px-3 py-2 bg-white border rounded hover:bg-gray-100"
            >
              {r.title} <span className="text-xs text-gray-500 ml-2">{r.jid}</span>
            </button>
          ))}
          {(!defaultChatRooms || defaultChatRooms.length === 0) && (
            <div className="text-gray-500 text-sm">No default rooms; create one in the Chats tab.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Helpers and modals
// ---------------------------------------------------------------------------

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-gray-600 mb-1">{label}</span>
    {children}
  </label>
);

const CreateAgentModal: React.FC<{
  draft: Partial<ModelAgent>;
  setDraft: React.Dispatch<React.SetStateAction<Partial<ModelAgent>>>;
  onCancel: () => void;
  onCreate: () => void;
}> = ({ draft, setDraft, onCancel, onCreate }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-5 w-[480px] max-w-[90%] space-y-3">
      <h3 className="text-lg font-semibold">Create new Agent</h3>
      <Field label="Display name">
        <input className="border rounded px-2 py-1 w-full" value={draft.displayName || ''} onChange={(e) => setDraft({ ...draft, displayName: e.target.value })} />
      </Field>
      <Field label="Bio (short)">
        <textarea className="border rounded px-2 py-1 w-full" rows={2} value={draft.bio || ''} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
      </Field>
      <Field label="Initial prompt">
        <textarea className="border rounded px-2 py-1 w-full font-mono text-sm" rows={5} value={draft.prompt || ''} onChange={(e) => setDraft({ ...draft, prompt: e.target.value })} />
      </Field>
      <Field label="Visibility">
        <select className="border rounded px-2 py-1" value={draft.visibility || 'private'} onChange={(e) => setDraft({ ...draft, visibility: e.target.value as any })}>
          <option value="private">Private</option>
          <option value="unlisted">Unlisted (invite by address)</option>
          <option value="public">Public</option>
        </select>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="border rounded px-4 py-2 hover:bg-gray-100">Cancel</button>
        <button onClick={onCreate} className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2">Create</button>
      </div>
    </div>
  </div>
);

const BrowsePublicModal: React.FC<{
  appId: string;
  onClose: () => void;
  onCloned: () => void;
}> = ({ appId, onClose, onCloned }) => {
  const [list, setList] = useState<ModelAgent[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    actionListAgents({ visibility: 'public' })
      .then((items) => setList(items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-[640px] max-w-[95%] max-h-[80vh] overflow-auto space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Public agents</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black">&times;</button>
        </div>
        {loading && <div className="text-gray-500">Loading...</div>}
        {!loading && list.length === 0 && <div className="text-gray-500">No public agents available.</div>}
        {list.map((a) => (
          <div key={a.id} className="border rounded p-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="font-semibold">{a.displayName}</div>
              <div className="text-xs text-gray-500">{a.bio}</div>
              <div className="text-[10px] text-gray-400 break-all">{a.address}</div>
            </div>
            <button
              onClick={async () => {
                try {
                  await actionCloneAgent(a.id, { ownerAppId: appId });
                  toast.success(`Cloned "${a.displayName}"`);
                  onCloned();
                  onClose();
                } catch (e: any) {
                  toast.error(`Clone failed: ${e?.response?.data?.error || e.message}`);
                }
              }}
              className="border rounded px-3 py-1 text-sm hover:bg-gray-100"
            >
              Clone to my agents
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
