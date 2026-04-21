// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Per-Agent edit panels, used by both:
//   - the new global Agents area (/app/admin/agents/:agentId/settings)
//   - any legacy per-app entry-point that still embeds them
//
// Each panel takes an Agent + an `appId` for scoping (Web Index / Docs Index need
// to know which App to ingest under, since the `documents` table still keys by
// (appId, agentId) for back-compat).

import { ChangeEvent, useEffect, useRef, useState } from 'react';
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
  httpListAgentBotInstances,
} from '../../../http';
import { ModelAgent, ModelAppDefaulRooom, ModelBotInstance } from '../../../models';
import { agentPromptTemplates } from '../../../constants/agentPromptTemplates';

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
// In the global Agents UI we pick the agent's `originAppId` (the App where it was created)
// as the default scope, but the operator can override (TODO: app picker if needed).

export const WebIndexPanel: React.FC<{ agent: ModelAgent; appId: string; isDisabled?: boolean }> = ({ agent, appId, isDisabled }) => {
  const [url, setUrl] = useState('');
  const [followLink, setFollowLink] = useState(true);
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-3 max-w-2xl">
      <div className="text-sm text-gray-600">
        Crawl a website and store content as embeddings under this agent's RAG namespace.
        {!appId && (
          <div className="mt-1 text-xs text-amber-600">
            No origin app set on this agent — use one of its deployed apps to ingest sources.
          </div>
        )}
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

export const DocsIndexPanel: React.FC<{ agent: ModelAgent; appId: string; isDisabled?: boolean }> = ({ agent, appId, isDisabled }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-3 max-w-2xl">
      <div className="text-sm text-gray-600">
        Upload PDFs, DOCX, MD, TXT to index under this agent.
        {!appId && (
          <div className="mt-1 text-xs text-amber-600">
            No origin app set on this agent — use one of its deployed apps to ingest sources.
          </div>
        )}
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
// every App this Agent is deployed in (with the rooms it joined per-App). That makes
// it useful from the global Agents UI which has no per-App context of its own.
type AgentBotInstance = ModelBotInstance & { appName?: string };

export const ChatsIndexPanel: React.FC<{
  agent: ModelAgent;
  defaultChatRooms?: ModelAppDefaulRooom[];
  scopedAppId?: string;
}> = ({ agent, defaultChatRooms, scopedAppId }) => {
  const [items, setItems] = useState<AgentBotInstance[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    httpListAgentBotInstances(agent.id)
      .then((r) => setItems(r.data?.items || []))
      .catch(() => setItems([]));
  }, [agent.id]);

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600">
        Per-App embodiments and rooms this Agent has joined. Phase 2 will surface deep
        chat history retrieval here.
      </div>
      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">App</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Rooms joined</th>
              <th className="text-left p-2">Last active</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="p-3 text-gray-500">
                  Not deployed to any App yet.
                </td>
              </tr>
            )}
            {items.map((bi) => (
              <tr key={bi.id} className="border-t align-top">
                <td className="p-2">
                  <div className="font-semibold">{bi.appName || '(unknown app)'}</div>
                  <div className="text-[10px] text-gray-400">{bi.appId}</div>
                </td>
                <td className="p-2">{bi.status}</td>
                <td className="p-2">
                  {(bi.joinedRooms || []).length === 0 ? (
                    <span className="text-gray-500">none</span>
                  ) : (
                    (bi.joinedRooms || []).map((r) => (
                      <div key={r} className="font-mono text-[11px]">{r}</div>
                    ))
                  )}
                </td>
                <td className="p-2 text-gray-500">{bi.lastActiveAt || ''}</td>
              </tr>
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
                    // Refresh listing.
                    const refreshed = await httpListAgentBotInstances(agent.id);
                    setItems(refreshed.data?.items || []);
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
