// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Per-Agent edit panels, used by both:
//   - the new global Agents area (/app/admin/agents/:agentId/settings)
//   - any legacy per-app entry-point that still embeds them
//
// Each panel takes an Agent + an `appId` for scoping (Web Index / Docs Index need
// to know which App to ingest under, since the `documents` table still keys by
// (appId, agentId) for back-compat).

import classNames from 'classnames';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  actionUpdateAgent,
  actionUpdateAgentSoul,
  actionInviteAgentToChat,
  actionListBotInstances,
} from '../../../actions';
import {
  httpAgentDocsUpload,
  httpAgentSiteCrawl,
  httpDiagAgentBotInstance,
  httpLeaveChatAgentBotInstance,
  httpListAgentBotInstances,
  httpListSiteSourcesV2,
  httpReindexSiteSourceV2,
  httpDeleteSiteSourceV2Url,
  httpTestMessageAgentBotInstance,
} from '../../../http';
import { ModelAgent, ModelAppDefaulRooom, ModelBotInstance } from '../../../models';
import { agentPromptTemplates } from '../../../constants/agentPromptTemplates';
import { useAppStore } from '../../../store/useAppStore';

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-gray-600 mb-1">{label}</span>
    {children}
  </label>
);

export const PersonaPanel: React.FC<{ agent: ModelAgent; isDisabled?: boolean }> = ({ agent, isDisabled }) => {
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
        <input
          type="number"
          min={0}
          className="border rounded px-2 py-1 w-32"
          disabled={isDisabled}
          value={cooldownSec}
          onChange={(e) => setCooldownSec(parseInt(e.target.value || '0', 10))}
        />
      </Field>
      <button onClick={save} disabled={isDisabled} className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 disabled:opacity-50">
        Save persona
      </button>
    </div>
  );
};

export const ContextPanel: React.FC<{ agent: ModelAgent; isDisabled?: boolean }> = ({ agent, isDisabled }) => {
  const [prompt, setPrompt] = useState(agent.prompt);
  useEffect(() => setPrompt(agent.prompt), [agent.id]);
  return (
    <div className="space-y-3 max-w-3xl">
      <div className="flex items-center gap-2 flex-wrap">
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

// Web Index / Docs Index need an appId because source ingestion still keys per-(appId, agentId).
// Default scope is the agent's originAppId (where it was created). The operator can
// switch to a different App they own — useful when the same agent is deployed across
// multiple apps and you want to ingest sources under a specific one.

type SiteSourceRow = {
  id: string;
  url: string;
  originUrl?: string;
  mdByteSize?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
};

function fmtBytesShort(n?: number | null) {
  const v = Number(n) || 0;
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
  return `${(v / (1024 * 1024)).toFixed(1)} MB`;
}

const AppScopePicker: React.FC<{
  agent: ModelAgent;
  appId: string;
  onChange: (appId: string) => void;
}> = ({ agent, appId, onChange }) => {
  const apps = useAppStore((s) => s.apps);
  // Only the user's own apps are eligible scopes (anything else and the auth check
  // on /v2/apps/:appId/sources/* would 403).
  if (apps.length <= 1) return null;
  return (
    <label className="flex items-center gap-2 text-xs text-gray-600">
      <span>Scope app:</span>
      <select
        className="border rounded px-2 py-1 text-xs"
        value={appId}
        onChange={(e) => onChange(e.target.value)}
      >
        {!appId && <option value="">(pick an app)</option>}
        {apps.map((a) => (
          <option key={a._id} value={a._id}>
            {a.displayName}{a._id === agent.originAppId ? ' (origin)' : ''}
          </option>
        ))}
      </select>
    </label>
  );
};

export const WebIndexPanel: React.FC<{ agent: ModelAgent; appId: string; isDisabled?: boolean }> = ({ agent, appId: initialAppId, isDisabled }) => {
  const apps = useAppStore((s) => s.apps);
  const [appId, setAppId] = useState<string>(initialAppId);
  const [url, setUrl] = useState('');
  const [followLink, setFollowLink] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<SiteSourceRow[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // If the parent's scope wasn't usable (e.g. agent has no originAppId), fall back to
  // the user's first owned app so the UI is functional out of the box.
  useEffect(() => {
    if (!appId && apps.length > 0) setAppId(apps[0]._id);
  }, [apps, appId]);
  // Sync when the parent's initialAppId resolves later.
  useEffect(() => {
    if (initialAppId && initialAppId !== appId) setAppId(initialAppId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAppId]);

  const loadList = async () => {
    if (!appId) {
      setRows([]);
      return;
    }
    setLoadingList(true);
    try {
      const r = await httpListSiteSourcesV2(appId);
      // Endpoint returns { result: SiteSourceRow[] } in v2.
      const items: SiteSourceRow[] = r.data?.result || r.data?.items || [];
      setRows(items);
    } catch (e: any) {
      toast.error(`Failed to load indexed URLs: ${e?.response?.data?.error || e.message}`);
      setRows([]);
    } finally {
      setLoadingList(false);
    }
  };
  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  return (
    <div className="space-y-3 max-w-3xl">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm text-gray-600">
          Crawl a website and store content as embeddings under this agent's RAG namespace.
          {!appId && (
            <div className="mt-1 text-xs text-amber-600">
              No app picked — open an app in admin first or pick one below.
            </div>
          )}
        </div>
        <AppScopePicker agent={agent} appId={appId} onChange={setAppId} />
      </div>

      <div className="flex gap-2">
        <input
          className="border rounded px-2 py-1 flex-1"
          disabled={isDisabled || busy || !appId}
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" disabled={isDisabled || busy || !appId} checked={followLink} onChange={(e) => setFollowLink(e.target.checked)} />
          follow links
        </label>
        <button
          disabled={isDisabled || busy || !url || !appId}
          onClick={async () => {
            setBusy(true);
            try {
              await httpAgentSiteCrawl(appId, agent.id, url, followLink);
              toast.success('Crawl queued');
              setUrl('');
              // Re-fetch the list so the new pages appear.
              await loadList();
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
        {appId && (
          <> · {rows.length} indexed URL{rows.length === 1 ? '' : 's'} in this app</>
        )}
      </div>

      {/* Indexed URLs table - ported from the legacy AI Widget LinksTable. Shows every
          row stored under the scoped app's siteSource collection. NB: the siteSource
          model is keyed by appId only today, so for migrated apps this list may include
          pages indexed by other agents that share the same app. We surface that as an
          "(other agents)" hint when the row's url didn't originate from this agent's
          recent crawls. */}
      <div className="border rounded">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">URL</th>
              <th className="text-left p-2 w-24">Size</th>
              <th className="text-left p-2 w-32">Updated</th>
              <th className="p-2 w-28"></th>
            </tr>
          </thead>
          <tbody>
            {loadingList && (
              <tr><td colSpan={4} className="p-3 text-gray-500">Loading...</td></tr>
            )}
            {!loadingList && rows.length === 0 && (
              <tr><td colSpan={4} className="p-3 text-gray-500">No URLs indexed for this app yet.</td></tr>
            )}
            {!loadingList && rows.map((row) => (
              <tr key={row.id} className="border-t align-top">
                <td className="p-2">
                  <div className="font-mono break-all">{row.url}</div>
                  {row.originUrl && row.originUrl !== row.url && (
                    <div className="text-gray-400 text-[10px] mt-0.5">via {row.originUrl}</div>
                  )}
                </td>
                <td className="p-2 text-gray-600">{fmtBytesShort(row.mdByteSize)}</td>
                <td className="p-2 text-gray-500">{row.updatedAt ? new Date(row.updatedAt).toLocaleString() : ''}</td>
                <td className="p-2 text-right whitespace-nowrap">
                  <button
                    disabled={isDisabled || busy}
                    onClick={async () => {
                      try {
                        await httpReindexSiteSourceV2(appId, row.id);
                        toast.success('Reindex queued');
                        await loadList();
                      } catch (e: any) {
                        toast.error(`Reindex failed: ${e?.response?.data?.error || e.message}`);
                      }
                    }}
                    className="text-brand-500 hover:underline mr-2"
                  >
                    Reindex
                  </button>
                  <button
                    disabled={isDisabled || busy}
                    onClick={async () => {
                      if (!confirm(`Remove "${row.url}" from the index?`)) return;
                      try {
                        await httpDeleteSiteSourceV2Url(appId, row.url);
                        toast.success('Removed');
                        await loadList();
                      } catch (e: any) {
                        toast.error(`Remove failed: ${e?.response?.data?.error || e.message}`);
                      }
                    }}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const DocsIndexPanel: React.FC<{ agent: ModelAgent; appId: string; isDisabled?: boolean }> = ({ agent, appId: initialAppId, isDisabled }) => {
  const apps = useAppStore((s) => s.apps);
  const fileRef = useRef<HTMLInputElement>(null);
  const [appId, setAppId] = useState<string>(initialAppId);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!appId && apps.length > 0) setAppId(apps[0]._id);
  }, [apps, appId]);
  useEffect(() => {
    if (initialAppId && initialAppId !== appId) setAppId(initialAppId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAppId]);

  return (
    <div className="space-y-3 max-w-2xl">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm text-gray-600">
          Upload PDFs, DOCX, MD, TXT to index under this agent.
          {!appId && (
            <div className="mt-1 text-xs text-amber-600">
              No app picked — open an app in admin first or pick one below.
            </div>
          )}
        </div>
        <AppScopePicker agent={agent} appId={appId} onChange={setAppId} />
      </div>
      <input
        ref={fileRef}
        type="file"
        multiple
        disabled={isDisabled || busy || !appId}
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

export const SoulMdPanel: React.FC<{ agent: ModelAgent; isDisabled?: boolean }> = ({ agent, isDisabled }) => {
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

export const HeartbeatPanel: React.FC<{ agent: ModelAgent; isDisabled?: boolean }> = ({ agent, isDisabled }) => {
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

// Chats Index now uses the new GET /v2/agents/:id/bot-instances endpoint to enumerate
// every App this Agent is deployed in (with the rooms it joined per-App). Each row can
// be expanded to show:
//   - live ai-service diagnostic (XMPP online?, joined rooms, last error, response mode)
//   - last conversation entries from ai-service's conversationModel
//
// Each room within an App row carries [Test] and [Leave] actions so the operator can
// (a) verify the bot can deliver a stanza into that specific room and (b) remove the
// bot from a single room without stopping it elsewhere.
//
// This is the primary "why isn't my bot responding?" diagnostic surface.

type RoomDetail = { jid: string; name: string; title: string };
type AgentBotInstance = ModelBotInstance & {
  appName?: string;
  // Optional new field returned by the API: per-room human-readable titles.
  // Falls back to local-part when missing.
  joinedRoomsDetails?: RoomDetail[];
};
type DiagState = {
  ok: boolean;
  botInstance?: any;
  aiService?: {
    inMem?: any;
    persisted?: any;
    conversations?: Array<{
      createdAt: string;
      chatJID: string;
      nickname: string;
      message: string;
      response: string;
    }>;
  } | null;
  aiServiceError?: string | null;
};

// Renders the per-App row's "Rooms joined" cell as a list of room titles, each with
// inline [Test] and [Leave] buttons. Test sends a system message into ONLY that room
// (uses the test-message endpoint's roomJid filter). Leave removes the BotInstance from
// only that room without stopping it elsewhere. Refreshes the parent list on success.
const RoomActionsList: React.FC<{
  agent: ModelAgent;
  bi: AgentBotInstance;
  onChanged?: () => void;
}> = ({ agent, bi, onChanged }) => {
  const [busy, setBusy] = useState<string | null>(null);

  // Prefer joinedRoomsDetails (with titles); fall back to plain JIDs if the API hasn't
  // shipped them yet.
  const rows: RoomDetail[] = useMemo(() => {
    if (Array.isArray(bi.joinedRoomsDetails) && bi.joinedRoomsDetails.length > 0) {
      return bi.joinedRoomsDetails;
    }
    return (bi.joinedRooms || []).map((jid) => {
      const local = String(jid).split('@')[0];
      return { jid, name: local, title: local };
    });
  }, [bi.joinedRoomsDetails, bi.joinedRooms]);

  if (rows.length === 0) {
    return <span className="text-gray-500 text-xs">none</span>;
  }

  return (
    <ul className="space-y-1">
      {rows.map((r) => {
        const rowBusy = busy === r.jid;
        return (
          <li key={r.jid} className="flex items-center gap-2 flex-wrap">
            <span className="text-sm" title={r.jid}>{r.title || r.name}</span>
            <button
              disabled={rowBusy}
              onClick={async () => {
                setBusy(r.jid);
                try {
                  const resp = await httpTestMessageAgentBotInstance(agent.id, bi.id, undefined, r.jid);
                  const data = resp.data;
                  if (data?.ok && (data.sent ?? 0) > 0) {
                    toast.success(`Test sent to "${r.title}"`);
                  } else {
                    toast.warn(`Sent failed: ${data?.results?.[0]?.error || data?.message || 'unknown'}`);
                  }
                } catch (e: any) {
                  const data = e?.response?.data;
                  toast.error(`Test failed: ${data?.message || data?.error || e.message}`);
                } finally {
                  setBusy(null);
                }
              }}
              className="text-[11px] border rounded px-2 py-0.5 hover:bg-gray-100 disabled:opacity-50"
              title="Send a system test message into this room only"
            >
              {rowBusy ? '...' : 'Test'}
            </button>
            <button
              disabled={rowBusy}
              onClick={async () => {
                if (!confirm(`Remove "${agent.displayName || 'agent'}" from "${r.title}"? The bot stays running and can be re-invited later.`)) return;
                setBusy(r.jid);
                try {
                  await httpLeaveChatAgentBotInstance(agent.id, bi.id, r.jid);
                  toast.success(`Left "${r.title}"`);
                  onChanged?.();
                } catch (e: any) {
                  toast.error(`Leave failed: ${e?.response?.data?.error || e.message}`);
                } finally {
                  setBusy(null);
                }
              }}
              className="text-[11px] border rounded px-2 py-0.5 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              title="Remove this BotInstance from this room (does not stop the bot)"
            >
              Leave
            </button>
            {/* Show the JID as a faint hint - useful for diagnostics, not for everyday use */}
            <span className="font-mono text-[9px] text-gray-400 break-all hidden lg:inline">{r.jid}</span>
          </li>
        );
      })}
    </ul>
  );
};

const DiagRow: React.FC<{ agent: ModelAgent; bi: AgentBotInstance; onChanged?: () => void }> = ({ agent, bi, onChanged }) => {
  const [open, setOpen] = useState(false);
  const [diag, setDiag] = useState<DiagState | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const r = await httpDiagAgentBotInstance(agent.id, bi.id);
      setDiag(r.data);
    } catch (e: any) {
      setDiag({ ok: false, aiServiceError: e?.response?.data?.error || e.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && !diag) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const inMem = diag?.aiService?.inMem;
  const dotClass = !diag
    ? 'bg-gray-300'
    : !inMem?.spawned
      ? 'bg-red-500'
      : !inMem?.online
        ? 'bg-yellow-500'
        : (inMem?.joinedRooms?.length || 0) === 0
          ? 'bg-yellow-500'
          : 'bg-green-500';
  const dotTitle = !diag
    ? 'Not loaded yet'
    : !inMem?.spawned
      ? 'No XmppClient process for this bot in ai-service'
      : !inMem?.online
        ? `Spawned but not online${inMem?.lastError ? ': ' + inMem.lastError : ''}`
        : (inMem?.joinedRooms?.length || 0) === 0
          ? 'Online but not in any MUC room'
          : 'Online and in MUC';

  return (
    <>
      <tr className="border-t align-top">
        <td className="p-2">
          <div className="flex items-center gap-2">
            <span className={classNames('inline-block w-2 h-2 rounded-full', dotClass)} title={dotTitle} />
            <div className="min-w-0">
              <div className="font-semibold truncate">{bi.appName || '(unknown app)'}</div>
              <div className="text-[10px] text-gray-400 truncate">{bi.appId}</div>
            </div>
          </div>
        </td>
        <td className="p-2">
          <span
            className={classNames(
              'inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold',
              bi.status === 'on' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
            )}
            title={
              bi.status === 'on'
                ? 'ai-service has spawned an XmppClient for this BotInstance — bot is connected and will participate in the rooms below.'
                : 'BotInstance is stopped — XmppClient is torn down. Rooms are still listed (persisted) but the bot is not actually in them and won’t speak. Use the agent header Start to re-spawn.'
            }
          >
            {bi.status}
          </span>
        </td>
        <td className="p-2">
          <RoomActionsList agent={agent} bi={bi} onChanged={onChanged} />
        </td>
        <td className="p-2 text-gray-500 text-xs">{bi.lastActiveAt || ''}</td>
        <td className="p-2 text-right">
          <button
            onClick={() => setOpen(!open)}
            className="text-xs text-brand-500 hover:underline"
          >
            {open ? 'Hide' : 'Inspect'}
          </button>
        </td>
      </tr>
      {open && (
        <tr className="border-t bg-gray-50">
          <td colSpan={5} className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={refresh} disabled={loading} className="text-xs border rounded px-2 py-1 hover:bg-gray-100">
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              {diag?.aiServiceError && (
                <span className="text-xs text-red-600">ai-service error: {diag.aiServiceError}</span>
              )}
            </div>
            {diag && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="font-semibold mb-1">In-memory (ai-service runtime)</div>
                  <dl className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    <DiagItem label="Spawned" value={String(inMem?.spawned ?? false)} />
                    <DiagItem label="Online" value={String(inMem?.online ?? false)} />
                    <DiagItem label="Joined rooms (XMPP)" value={String(inMem?.joinedRooms?.length ?? 0)} />
                    <DiagItem label="Pending rooms" value={String(inMem?.pendingRooms?.length ?? 0)} />
                    <DiagItem label="Response mode" value={inMem?.responseMode || inMem?.trigger || 'default'} />
                    <DiagItem label="RAG" value={String(inMem?.isRAG ?? false)} />
                    <DiagItem label="Cooldown (s)" value={String(inMem?.cooldownSec ?? 0)} />
                    <DiagItem label="Prompt length" value={String(inMem?.promptLength ?? 0)} />
                    <DiagItem label="Last error" value={inMem?.lastError || '—'} />
                  </dl>
                  {(inMem?.joinedRooms || []).length > 0 && (
                    <div className="mt-2">
                      <div className="text-gray-500 mb-1">XMPP joined rooms:</div>
                      {inMem.joinedRooms.map((r: string) => (
                        <div key={r} className="font-mono text-[10px] break-all">{r}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold mb-1">Last conversations</div>
                  {(diag.aiService?.conversations || []).length === 0 ? (
                    <div className="text-gray-500">
                      None recorded yet. If the bot is online + in the room but you've sent
                      messages and see nothing here, the stanza handler in ai-service is
                      not seeing the messages — check ai-service logs and ejabberd MUC config.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-auto pr-2">
                      {diag.aiService!.conversations!.map((c, i) => (
                        <div key={i} className="border rounded p-2 bg-white">
                          <div className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleString()}</div>
                          <div><span className="text-gray-500">{c.nickname}:</span> {c.message}</div>
                          <div className="mt-1 pl-2 border-l-2 border-brand-200 text-gray-700">{c.response}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
};

const DiagItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <>
    <dt className="text-gray-500">{label}</dt>
    <dd className="font-mono break-all">{value}</dd>
  </>
);

export const ChatsIndexPanel: React.FC<{
  agent: ModelAgent;
  defaultChatRooms?: ModelAppDefaulRooom[];
  scopedAppId?: string;
}> = ({ agent, defaultChatRooms, scopedAppId }) => {
  const [items, setItems] = useState<AgentBotInstance[]>([]);
  const [busy, setBusy] = useState(false);

  function reload() {
    httpListAgentBotInstances(agent.id)
      .then((r) => setItems(r.data?.items || []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.id]);

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        Per-App embodiments of this Agent and the rooms each is in.
        Click "Inspect" on a row to see live ai-service runtime state (online? in-room?
        last error?) and the last few message/response pairs — useful for diagnosing
        "the bot doesn't respond".
      </div>
      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 w-1/4">App</th>
              <th
                className="text-left p-2 w-28"
                title="Bot lifecycle in this app: 'on' = ai-service has spawned an XmppClient and the bot will participate in the rooms below; 'off' = teardown, the bot won't speak in this app even though rooms are still listed."
              >
                Bot in app
              </th>
              <th className="text-left p-2">Rooms joined (with per-room actions)</th>
              <th className="text-left p-2 w-32">Last active</th>
              <th className="p-2 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-gray-500">
                  Not deployed to any App yet.
                </td>
              </tr>
            )}
            {items.map((bi) => (
              <DiagRow key={bi.id} agent={agent} bi={bi} onChanged={reload} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Optional: quick-invite the agent into a default room of the scoped App
          (only shown when this panel is rendered inside a per-App context). */}
      {scopedAppId && defaultChatRooms && defaultChatRooms.length > 0 && (
        <div className="border rounded p-3 bg-gray-50">
          <div className="text-sm font-semibold mb-2">Invite to a default room of this app</div>
          <div className="flex flex-col gap-2">
            {defaultChatRooms.map((r) => (
              <button
                key={r.chatId}
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await actionInviteAgentToChat(agent.id, { appId: scopedAppId, chatId: r.chatId });
                    toast.success(`Invited to ${r.title}`);
                    reload();
                    await actionListBotInstances({ appId: scopedAppId });
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
          </div>
        </div>
      )}
    </div>
  );
};
