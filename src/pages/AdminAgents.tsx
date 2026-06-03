// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// AdminAgents: top-level Agents list (sibling of AdminApps).
// Lists every Agent the current user owns + a "+ New Agent" affordance and a public
// browser. Agents are tenant-level (one user can own many that get deployed across
// many Apps), so this page deliberately does not live under a per-App context.
//
// Each row carries enough metadata (origin app name, updatedAt, RAG size, # of
// BotInstances) to disambiguate identically-named entries (e.g. the wave of
// "AI Bot" rows the migration creates from legacy App.aiBot rows).

import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  actionCloneAgent,
  actionCreateAgent,
  actionDeleteAgent,
  actionListAgents,
} from '../actions';
import { ModelAgent } from '../models';
import { useAppStore } from '../store/useAppStore';

function fmtDate(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}

function fmtBytes(n?: number | null) {
  const v = Number(n) || 0;
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
  return `${(v / (1024 * 1024)).toFixed(1)} MB`;
}

const VISIBILITY_BADGE: Record<string, string> = {
  public: 'bg-green-100 text-green-700',
  unlisted: 'bg-yellow-100 text-yellow-700',
  private: 'bg-gray-100 text-gray-600',
};

export default function AdminAgents() {
  const agents = useAppStore((s) => s.agents);
  const apps = useAppStore((s) => s.apps);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showBrowsePublic, setShowBrowsePublic] = useState(false);
  const [filter, setFilter] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Initial fetch: own + public agents (backend default when no `visibility` is
  // passed). Public agents include the platform-supplied Support Agent that
  // every App's AI Widget points to by default; surfacing it here means
  // operators can click "Edit in Manage agents" from the persona card and
  // actually land on something they can browse. AgentCard already shows the
  // visibility badge, so private and public agents render side-by-side without
  // confusion.
  useEffect(() => {
    setLoading(true);
    actionListAgents({})
      .catch((e) => toast.error(`Failed to load agents: ${e?.response?.data?.error || e.message}`))
      .finally(() => setLoading(false));
  }, []);

  // Map appId -> displayName for fallback when the API didn't populate originAppName
  // (e.g. for newly-created agents pre-refresh).
  const appNameById = useMemo(() => {
    const m = new Map<string, string>();
    apps.forEach((a) => m.set(a._id, a.displayName));
    return m;
  }, [apps]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter((a) => {
      return (
        (a.displayName || '').toLowerCase().includes(q) ||
        (a.address || '').toLowerCase().includes(q) ||
        (a.bio || '').toLowerCase().includes(q) ||
        (a.originAppName || '').toLowerCase().includes(q) ||
        (appNameById.get(a.originAppId || '') || '').toLowerCase().includes(q)
      );
    });
  }, [agents, filter, appNameById]);

  const visible = showAll ? filtered : filtered.slice(0, 100);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-varela">AI Agents</h2>
          <p className="text-sm text-gray-500">
            Agents are owned by your account and can be deployed into any of your Apps.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            placeholder="Filter (name, address, app, bio)"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-64"
          />
          <button
            onClick={() => setShowBrowsePublic(true)}
            className="border border-gray-300 hover:bg-gray-100 rounded-xl px-4 py-2 text-sm"
          >
            Browse public
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-brand-500 hover:bg-brand-400 text-white rounded-xl px-4 py-2 text-sm"
          >
            + New Agent
          </button>
        </div>
      </div>

      {loading && agents.length === 0 && <div className="text-gray-500">Loading...</div>}

      {!loading && agents.length === 0 && (
        <div className="p-6 border border-dashed rounded-xl text-gray-500">
          No agents yet. Click "+ New Agent" to create one.
        </div>
      )}

      {agents.length > 0 && (
        <>
          <div className="text-xs text-gray-500 mb-2">
            Showing {visible.length} of {filtered.length}
            {filtered.length !== agents.length && ` (filtered from ${agents.length})`}
            {filtered.length > 100 && !showAll && (
              <button onClick={() => setShowAll(true)} className="ml-2 text-brand-500 hover:underline">
                show all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {visible.map((a) => (
              <AgentCard
                key={a.id}
                agent={a}
                onOpen={() => navigate(`/app/admin/agents/${a.id}/settings`)}
                onDelete={async () => {
                  if (!confirm(`Delete "${a.displayName}"? Disables all its BotInstances.`)) return;
                  try {
                    await actionDeleteAgent(a.id);
                    toast.success('Agent deleted');
                  } catch (e: any) {
                    toast.error(`Delete failed: ${e?.response?.data?.error || e.message}`);
                  }
                }}
              />
            ))}
          </div>
        </>
      )}

      {showCreate && (
        <CreateAgentModal
          onCancel={() => setShowCreate(false)}
          onCreated={(agent) => {
            setShowCreate(false);
            navigate(`/app/admin/agents/${agent.id}/settings`);
          }}
        />
      )}

      {showBrowsePublic && (
        <BrowsePublicModal
          onClose={() => setShowBrowsePublic(false)}
          onCloned={() => actionListAgents({})}
        />
      )}
    </div>
  );
}

const AgentCard: React.FC<{
  agent: ModelAgent;
  onOpen: () => void;
  onDelete: () => void;
}> = ({ agent, onOpen, onDelete }) => {
  // Note: ownerApp is intentionally not surfaced in the card UI - Agents are
  // tenant-level. Was previously rendered as "Created in: ..." linked to /apps/:id/settings.
  const visibilityClass = VISIBILITY_BADGE[agent.visibility] || VISIBILITY_BADGE.private;
  return (
    <div className="border rounded-xl p-3 hover:border-brand-500 transition-colors flex flex-col gap-2 bg-white">
      <div className="flex items-start gap-3">
        {agent.avatarUrl ? (
          <img src={agent.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs">
            {(agent.displayName || 'AI').slice(0, 2).toUpperCase()}
          </div>
        )}
        <button onClick={onOpen} className="flex-1 min-w-0 text-left">
          <div className="font-semibold truncate">{agent.displayName || 'AI Bot'}</div>
          <div className="text-[10px] text-gray-400 break-all">{agent.address}</div>
        </button>
        <span className={classNames('text-[10px] px-2 py-0.5 rounded h-fit', visibilityClass)}>
          {agent.visibility}
        </span>
      </div>

      {/* Agents are tenant-level, not app-level — they can be deployed across many
          apps. We surface "Deployed in N app(s)" instead of the older "Created in"
          label since the latter implied an ownership relationship that no longer
          matches the model. originAppId is still kept on the schema as a soft
          default-scope hint for Web Index / Docs Index, but isn't shown here. */}
      <dl className="text-xs text-gray-600 grid grid-cols-2 gap-x-2 gap-y-0.5">
        <div>
          <dt className="inline text-gray-400">Updated: </dt>
          <dd className="inline">{fmtDate(agent.updatedAt) || '—'}</dd>
        </div>
        <div>
          <dt className="inline text-gray-400">Created: </dt>
          <dd className="inline">{fmtDate(agent.createdAt) || '—'}</dd>
        </div>
        <div>
          <dt className="inline text-gray-400">RAG: </dt>
          <dd className="inline">{fmtBytes(agent.totalSiteSourceSize)}</dd>
        </div>
        <div>
          <dt className="inline text-gray-400">Deployed: </dt>
          <dd className="inline">{typeof agent.botInstancesCount === 'number' ? `${agent.botInstancesCount} app${agent.botInstancesCount === 1 ? '' : 's'}` : '—'}</dd>
        </div>
      </dl>

      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <button onClick={onOpen} className="text-xs text-brand-500 hover:underline">Open</button>
        <span className="text-gray-300">|</span>
        <button onClick={onDelete} className="text-xs text-red-500 hover:underline">Delete</button>
      </div>
    </div>
  );
};

const CreateAgentModal: React.FC<{
  onCancel: () => void;
  onCreated: (agent: ModelAgent) => void;
}> = ({ onCancel, onCreated }) => {
  const apps = useAppStore((s) => s.apps);
  const currentApp = useAppStore((s) => s.currentApp);
  const [displayName, setDisplayName] = useState('New AI Agent');
  const [bio, setBio] = useState('');
  const [prompt, setPrompt] = useState('You are a helpful assistant.');
  const [visibility, setVisibility] = useState<'private' | 'unlisted' | 'public'>('private');
  // Agents are tenant-level. We auto-pick a default-scope App silently so the Web
  // Index / Docs Index panels have somewhere to send sources by default; the operator
  // can switch via the Scope-app picker on those tabs whenever they want.
  const defaultOwnerAppId = currentApp?._id || apps[0]?._id || '';
  const [busy, setBusy] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-[480px] max-w-[90%] space-y-3">
        <h3 className="text-lg font-semibold">Create new Agent</h3>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 mb-1">Display name</span>
          <input className="border rounded px-2 py-1 w-full" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 mb-1">Bio (short)</span>
          <textarea className="border rounded px-2 py-1 w-full" rows={2} value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 mb-1">Initial prompt</span>
          <textarea className="border rounded px-2 py-1 w-full font-mono text-sm" rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 mb-1">Visibility</span>
          <select className="border rounded px-2 py-1" value={visibility} onChange={(e) => setVisibility(e.target.value as any)}>
            <option value="private">Private</option>
            <option value="unlisted">Unlisted (invite by address)</option>
            <option value="public">Public</option>
          </select>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} disabled={busy} className="border rounded px-4 py-2 hover:bg-gray-100">Cancel</button>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                // Silently seed ownerAppId from the current app context so Web/Docs
                // Index have a default scope. The operator can switch the scope on
                // those tabs at any time. Tenant-level Agents shouldn't expose an
                // app-ownership concept in the create flow.
                const created = await actionCreateAgent({ displayName, bio, prompt, visibility, ownerAppId: defaultOwnerAppId || undefined });
                if (created) onCreated(created);
              } catch (e: any) {
                toast.error(`Create failed: ${e?.response?.data?.error || e.message}`);
              } finally {
                setBusy(false);
              }
            }}
            className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {busy ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

const BrowsePublicModal: React.FC<{ onClose: () => void; onCloned: () => void }> = ({ onClose, onCloned }) => {
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
                  await actionCloneAgent(a.id, {});
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
