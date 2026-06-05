// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// AdminAgents: top-level Agents list (sibling of AdminApps).
//
// Visibility model and sections in this view:
//   - "My agents" - this tenant owns them. Editable.
//   - "Public agents" - other tenants marked them visibility=public. Visible
//     across the platform, but read-only from any tenant that isn't the owner;
//     a Clone action is available so the viewer can spin up their own editable
//     copy.
//   - "Private (other tenants)" - shown only to superadmins (isSuperAdmin.read).
//     Cross-tenant audit cohort. Read-only.
//
// Both "My" and "Public" are shown by default; the viewer can toggle either
// off. The superadmin "Private" cohort is gated and off by default.

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

const PAGE_LIMIT = 100;

export default function AdminAgents() {
  const agents = useAppStore((s) => s.agents);
  const apps = useAppStore((s) => s.apps);
  const currentUser = useAppStore((s) => s.currentUser);
  const navigate = useNavigate();

  const currentUserId = currentUser?._id || '';
  const isSuperReadAdmin = !!currentUser?.isSuperAdmin?.read;

  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('');

  // Per-section "show all" toggles so each cohort paginates independently.
  const [showAllMine, setShowAllMine] = useState(false);
  const [showAllPublic, setShowAllPublic] = useState(false);
  const [showAllOtherPrivate, setShowAllOtherPrivate] = useState(false);

  // Section visibility checkboxes. "Mine" and "Public" default on. The
  // superadmin "Private (other tenants)" cohort is gated on isSuperReadAdmin
  // and defaults off so superadmins don't accidentally see other tenants'
  // private agents on every page load.
  const [showMine, setShowMine] = useState(true);
  const [showPublic, setShowPublic] = useState(true);
  const [showOtherPrivate, setShowOtherPrivate] = useState(false);

  // Fetch the "own + public" cohort (backend default). The store holds the
  // union; partition below by ownerId / visibility.
  useEffect(() => {
    setLoading(true);
    actionListAgents({})
      .catch((e) => toast.error(`Failed to load agents: ${e?.response?.data?.error || e.message}`))
      .finally(() => setLoading(false));
  }, []);

  // Superadmin "private (other tenants)" cohort fetched lazily when the
  // checkbox is first ticked so the default page load stays cheap.
  const [otherPrivate, setOtherPrivate] = useState<ModelAgent[]>([]);
  const [otherPrivateLoaded, setOtherPrivateLoaded] = useState(false);
  useEffect(() => {
    if (!isSuperReadAdmin || !showOtherPrivate || otherPrivateLoaded) return;
    actionListAgents({ visibility: 'private' as any })
      .then((items: ModelAgent[] | undefined) => {
        const filtered = (items || []).filter((a) => a.ownerId !== currentUserId);
        setOtherPrivate(filtered);
        setOtherPrivateLoaded(true);
      })
      .catch((e) => {
        toast.error(`Failed to load private agents: ${e?.response?.data?.error || e.message}`);
        setOtherPrivateLoaded(true);
      });
  }, [isSuperReadAdmin, showOtherPrivate, otherPrivateLoaded, currentUserId]);

  const appNameById = useMemo(() => {
    const m = new Map<string, string>();
    apps.forEach((a) => m.set(a._id, a.displayName));
    return m;
  }, [apps]);

  function matchesFilter(a: ModelAgent): boolean {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return (
      (a.displayName || '').toLowerCase().includes(q) ||
      (a.address || '').toLowerCase().includes(q) ||
      (a.bio || '').toLowerCase().includes(q) ||
      (a.originAppName || '').toLowerCase().includes(q) ||
      (appNameById.get(a.originAppId || '') || '').toLowerCase().includes(q)
    );
  }

  // Partition + filter. The store may contain duplicates between the
  // mine/public buckets if an operator marked one of their own as public;
  // we bucket by ownership first (mine wins) so each agent appears once.
  const mine = useMemo(
    () => agents.filter((a) => a.ownerId === currentUserId).filter(matchesFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agents, currentUserId, filter, appNameById]
  );
  const publicOthers = useMemo(
    () => agents.filter((a) => a.visibility === 'public' && a.ownerId !== currentUserId).filter(matchesFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agents, currentUserId, filter, appNameById]
  );
  const privateOthers = useMemo(
    () => otherPrivate.filter(matchesFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [otherPrivate, filter, appNameById]
  );

  function onDelete(a: ModelAgent) {
    return async () => {
      if (!confirm(`Delete "${a.displayName}"? Disables all its BotInstances.`)) return;
      try {
        await actionDeleteAgent(a.id);
        toast.success('Agent deleted');
      } catch (e: any) {
        toast.error(`Delete failed: ${e?.response?.data?.error || e.message}`);
      }
    };
  }

  async function onClone(a: ModelAgent) {
    try {
      await actionCloneAgent(a.id, {});
      toast.success(`Cloned "${a.displayName}" to your agents`);
      await actionListAgents({}); // refresh the store so the clone appears in My
    } catch (e: any) {
      toast.error(`Clone failed: ${e?.response?.data?.error || e.message}`);
    }
  }

  function renderSection(
    title: string,
    description: string,
    rows: ModelAgent[],
    showAll: boolean,
    setShowAll: (b: boolean) => void,
    cardMode: 'owned' | 'public' | 'private-other'
  ) {
    const visible = showAll ? rows : rows.slice(0, PAGE_LIMIT);
    return (
      <section className="mb-6">
        <div className="flex items-baseline gap-3 mb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-xs text-gray-500">{rows.length} agent{rows.length === 1 ? '' : 's'}</span>
        </div>
        <div className="text-xs text-gray-500 mb-2">{description}</div>
        {rows.length === 0 ? (
          <div className="p-4 border border-dashed rounded-xl text-gray-500 text-sm">
            {cardMode === 'owned'
              ? 'You haven\'t created any agents yet. Click "+ New Agent" above.'
              : cardMode === 'public'
              ? 'No public agents from other tenants right now.'
              : 'No private agents from other tenants right now.'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {visible.map((a) => (
                <AgentCard
                  key={a.id}
                  agent={a}
                  cardMode={cardMode}
                  onOpen={() => navigate(`/app/admin/agents/${a.id}/settings`)}
                  onDelete={onDelete(a)}
                  onClone={() => onClone(a)}
                />
              ))}
            </div>
            {rows.length > PAGE_LIMIT && (
              <div className="text-xs text-gray-500 mt-2">
                Showing {visible.length} of {rows.length}
                {!showAll && (
                  <button onClick={() => setShowAll(true)} className="ml-2 text-brand-500 hover:underline">
                    show all
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </section>
    );
  }

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      {/* Page-level header outside the white card - same shape as Apps. */}
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row gap-4">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          AI Agents
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            placeholder="Filter (name, address, app, bio)"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-64"
          />
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center h-[40px] bg-brand-500 rounded-xl hover:bg-brand-darker text-white text-sm font-varela px-4"
          >
            + New Agent
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 overflow-y-auto">
        <p className="text-sm text-gray-500 mb-4">
          Agents are owned by your account and can be deployed into any of your Apps.
        </p>

      {/* Section visibility checkboxes. Each toggles a band of the list. */}
      <div className="flex items-center gap-4 mb-4 flex-wrap text-sm">
        <span className="text-gray-500">Show:</span>
        <label className="inline-flex items-center gap-1 cursor-pointer">
          <input type="checkbox" checked={showMine} onChange={(e) => setShowMine(e.target.checked)} />
          <span>My agents</span>
        </label>
        <label className="inline-flex items-center gap-1 cursor-pointer">
          <input type="checkbox" checked={showPublic} onChange={(e) => setShowPublic(e.target.checked)} />
          <span>Public agents</span>
        </label>
        {isSuperReadAdmin && (
          <label className="inline-flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={showOtherPrivate} onChange={(e) => setShowOtherPrivate(e.target.checked)} />
            <span className="text-purple-700">Private (other tenants)</span>
            <span className="text-[10px] text-purple-700/70">superadmin</span>
          </label>
        )}
      </div>

      {loading && agents.length === 0 && <div className="text-gray-500">Loading...</div>}

      {showMine && renderSection(
        'My agents',
        'Created by you. You can edit, deploy across your Apps, change visibility, or delete.',
        mine,
        showAllMine,
        setShowAllMine,
        'owned'
      )}

      {showMine && showPublic && <hr className="my-6 border-gray-200" />}

      {showPublic && renderSection(
        'Public agents (from other tenants)',
        'Marked public by their owners on this server. Read-only — clone to your agents to customise.',
        publicOthers,
        showAllPublic,
        setShowAllPublic,
        'public'
      )}

      {showOtherPrivate && (showMine || showPublic) && <hr className="my-6 border-gray-200" />}

      {isSuperReadAdmin && showOtherPrivate && renderSection(
        'Private (other tenants)',
        'Superadmin-only view of private agents owned by other tenants. Read-only.',
        privateOthers,
        showAllOtherPrivate,
        setShowAllOtherPrivate,
        'private-other'
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
      </div>{/* end white card */}
    </div>
  );
}

type AgentCardMode = 'owned' | 'public' | 'private-other';

const AgentCard: React.FC<{
  agent: ModelAgent;
  cardMode: AgentCardMode;
  onOpen: () => void;
  onDelete: () => void;
  onClone: () => void;
}> = ({ agent, cardMode, onOpen, onDelete, onClone }) => {
  const visibilityClass = VISIBILITY_BADGE[agent.visibility] || VISIBILITY_BADGE.private;
  const isOwned = cardMode === 'owned';
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
        {/* The settings page renders editable fields for the owner, read-only
            for everyone else. The verb on this button matches what the viewer
            will actually see when they land there. */}
        <button onClick={onOpen} className="text-xs text-brand-500 hover:underline">
          {isOwned ? 'Edit' : 'View'}
        </button>
        {/* Clone is offered for non-owned PUBLIC agents (the prior "Browse
            public" modal's affordance, inlined into the card). Private
            (other tenants) intentionally has no clone — those are
            other tenants' work, not meant for redistribution; the
            superadmin who can see them is auditing, not shopping. */}
        {cardMode === 'public' && (
          <>
            <span className="text-gray-300">|</span>
            <button onClick={onClone} className="text-xs text-brand-500 hover:underline">
              Clone to my agents
            </button>
          </>
        )}
        {isOwned && (
          <>
            <span className="text-gray-300">|</span>
            <button onClick={onDelete} className="text-xs text-red-500 hover:underline">
              Delete
            </button>
          </>
        )}
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
        {/* Public is platform-wide visible. Operators who skim through "+ New
            Agent" defaults sometimes pick Public for an internal-only persona
            without realising other tenants will see it in their AI Agents
            list and be able to clone it. Make the trade-off explicit at
            create time so this is a deliberate choice. */}
        {visibility === 'public' && (
          <div className="rounded-md border border-yellow-300 bg-yellow-50 p-2 text-xs text-yellow-900 leading-snug">
            <strong>Public visibility:</strong> this agent will appear in the
            "Public agents" section for <em>every other tenant</em> on this
            Ethora server. They can view its persona, prompt, and clone it as
            their own. Pick <em>Public</em> only when the agent is intended to
            be universally useful (e.g. a generic Support Agent or a published
            persona for the community). For agents you're building for your
            own brand, business, or website, leave this as <em>Private</em>.
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} disabled={busy} className="border rounded px-4 py-2 hover:bg-gray-100">Cancel</button>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
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
