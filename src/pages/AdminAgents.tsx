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
import { IconAdd } from '../components/Icons/IconAdd';
import {
  actionCloneAgent,
  actionLoadOwnedApps,
  actionCreateAgent,
  actionDeleteAgent,
  actionListAgents,
} from '../actions';
import { httpExportAgent, httpImportAgent, saveBlobAs } from '../http';
import { ImportAppModal } from '../components/modal/ImportAppModal';
import { useTranslation } from '../i18n/useTranslation';
import { AGENT_CATEGORIES, AGENT_CATEGORY_LABEL_KEYS, AgentCategory, isAgentCategory } from '../lib/agentCategories';
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
  public: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
  unlisted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  private: 'bg-gray-100 text-gray-600',
};

const PAGE_LIMIT = 100;

export default function AdminAgents() {
  const { t } = useTranslation();
  const agents = useAppStore((s) => s.agents);
  const apps = useAppStore((s) => s.apps);
  const currentUser = useAppStore((s) => s.currentUser);
  const navigate = useNavigate();

  const currentUserId = currentUser?._id || '';
  const isSuperReadAdmin = !!currentUser?.isSuperAdmin?.read;

  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState<AgentCategory | ''>('');
  const [cloneTarget, setCloneTarget] = useState<ModelAgent | null>(null);

  // Per-section "show all" toggles so each cohort paginates independently.
  const [showAllMine, setShowAllMine] = useState(false);
  const [showAllPublic, setShowAllPublic] = useState(false);
  const [showAllOtherPrivate, setShowAllOtherPrivate] = useState(false);

  // "Mine" and "Public" always show, in that order. The
  // superadmin "Private (other tenants)" cohort is gated on isSuperReadAdmin
  // and defaults off so superadmins don't accidentally see other tenants'
  // private agents on every page load.
  const [showOtherPrivate, setShowOtherPrivate] = useState(false);

  // Fetch the "own + public" cohort (backend default). The store holds the
  // union; partition below by ownerId / visibility.
  useEffect(() => {
    setLoading(true);
    actionListAgents({})
      .catch((e) => toast.error(`${t('adminAgents.loadAgentsFailedPrefix')} ${e?.response?.data?.error || e.message}`))
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
        toast.error(`${t('adminAgents.loadPrivateAgentsFailedPrefix')} ${e?.response?.data?.error || e.message}`);
        setOtherPrivateLoaded(true);
      });
  }, [isSuperReadAdmin, showOtherPrivate, otherPrivateLoaded, currentUserId]);

  const appNameById = useMemo(() => {
    const m = new Map<string, string>();
    apps.forEach((a) => m.set(a._id, a.displayName));
    return m;
  }, [apps]);

  function matchesFilter(a: ModelAgent): boolean {
    if (category && !(a.categories || []).includes(category)) return false;
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
    [agents, currentUserId, filter, category, appNameById]
  );
  const publicOthers = useMemo(
    () => agents.filter((a) => a.visibility === 'public' && a.ownerId !== currentUserId).filter(matchesFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agents, currentUserId, filter, category, appNameById]
  );
  const privateOthers = useMemo(
    () => otherPrivate.filter(matchesFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [otherPrivate, filter, category, appNameById]
  );

  function onDelete(a: ModelAgent) {
    return async () => {
      if (!confirm(`${t('adminAgents.deleteConfirmQuestion')} "${a.displayName}"? ${t('adminAgents.deleteConfirmDetail')}`)) return;
      try {
        await actionDeleteAgent(a.id);
        toast.success(t('adminAgents.agentDeletedToast'));
      } catch (e: any) {
        toast.error(`${t('adminAgents.deleteFailedPrefix')} ${e?.response?.data?.error || e.message}`);
      }
    };
  }

  function onClone(a: ModelAgent) {
    setCloneTarget(a);
  }

  async function onExport(a: ModelAgent, format: 'json' | 'zip') {
    try {
      const r = await httpExportAgent(a.id, format);
      saveBlobAs(r.data, `ethora-agent-${a.id}-${Date.now()}.${format}`);
      toast.success(`${t('adminAgents.exportedToastPrefix')} "${a.displayName}" (${format.toUpperCase()})`);
    } catch (e: any) {
      toast.error(`${t('adminAgents.exportFailedPrefix')} ${e?.response?.data?.error || e.message}`);
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
          <span className="text-xs text-gray-500">{rows.length} {rows.length === 1 ? t('adminAgents.agentSingular') : t('adminAgents.agentPlural')}</span>
        </div>
        <div className="text-xs text-gray-500 mb-2">{description}</div>
        {rows.length === 0 ? (
          <div className="p-4 border border-dashed rounded-xl text-gray-500 text-sm">
            {cardMode === 'owned'
              ? t('adminAgents.emptyOwned')
              : cardMode === 'public'
              ? t('adminAgents.emptyPublic')
              : t('adminAgents.emptyPrivateOther')}
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
                  onExport={(fmt) => onExport(a, fmt)}
                  onDelete={onDelete(a)}
                  onClone={() => onClone(a)}
                />
              ))}
            </div>
            {rows.length > PAGE_LIMIT && (
              <div className="text-xs text-gray-500 mt-2">
                {t('adminAgents.showing')} {visible.length} {t('adminAgents.of')} {rows.length}
                {!showAll && (
                  <button onClick={() => setShowAll(true)} className="ml-2 text-brand-500 hover:underline">
                    {t('adminAgents.showAll')}
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
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row md:min-h-[40px] gap-4">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          {t('adminAgents.title')}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            placeholder={t('adminAgents.filterPlaceholder')}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-3 h-[40px] text-sm w-64"
          />
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center justify-center h-[40px] rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover text-sm font-varela px-4"
            title={t('adminAgents.importAgentTitle')}
          >
            {t('adminAgents.importAgent')}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center h-[40px] bg-brand-500 rounded-xl hover:bg-brand-darker text-white text-sm font-varela px-4"
          >
            <IconAdd color="white" className="mr-2" />
            <span>{t('adminAgents.newAgent')}</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 overflow-y-auto">
        <p className="text-sm text-gray-500 mb-4">
          {t('adminAgents.description')}
        </p>

      {/* Superadmins can also audit other tenants' private agents. Everyone
          else sees their own agents first, then the public ones. */}
      {isSuperReadAdmin && (
        <div className="flex items-center gap-4 mb-4 flex-wrap text-sm">
          <label className="inline-flex items-center gap-1 cursor-pointer">
            <input type="checkbox" checked={showOtherPrivate} onChange={(e) => setShowOtherPrivate(e.target.checked)} />
            <span className="text-purple-700 dark:text-purple-300">{t('adminAgents.privateOtherTenants')}</span>
            <span className="text-[10px] text-purple-700/70 dark:text-purple-300/70">{t('adminAgents.superadminBadge')}</span>
          </label>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 flex-wrap text-sm" role="group" aria-label={t('adminAgents.categoryLabel')}>
        <span className="text-gray-500">{t('adminAgents.categoryLabel')}</span>
        {(['', ...AGENT_CATEGORIES] as const).map((c) => (
          <button
            key={c || 'all'}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={classNames(
              'text-xs rounded-full px-3 py-1 border',
              category === c ? 'border-brand-500 bg-brand-50 text-brand-500' : 'border-gray-200 hover:bg-gray-100'
            )}
          >
            {c ? t(AGENT_CATEGORY_LABEL_KEYS[c]) : t('adminAgents.categoryAll')}
          </button>
        ))}
      </div>

      {loading && agents.length === 0 && <div className="text-gray-500">{t('adminAgents.loading')}</div>}

      {renderSection(
        t('adminAgents.myAgents'),
        t('adminAgents.myAgentsDesc'),
        mine,
        showAllMine,
        setShowAllMine,
        'owned'
      )}

      <hr className="my-6 border-gray-200" />

      {renderSection(
        t('adminAgents.publicAgentsTitle'),
        t('adminAgents.publicAgentsDesc'),
        publicOthers,
        showAllPublic,
        setShowAllPublic,
        'public'
      )}

      {isSuperReadAdmin && showOtherPrivate && <hr className="my-6 border-gray-200" />}

      {isSuperReadAdmin && showOtherPrivate && renderSection(
        t('adminAgents.privateOtherTenants'),
        t('adminAgents.privateOtherDesc'),
        privateOthers,
        showAllOtherPrivate,
        setShowAllOtherPrivate,
        'private-other'
      )}

      {cloneTarget && (
        <CloneAgentModal agent={cloneTarget} onClose={() => setCloneTarget(null)} />
      )}

      {showImport && (
        <ImportAppModal
          title={t('adminAgents.importAgent')}
          helperText={t('adminAgents.importAgentHelperText')}
          showDomainOverride={false}
          onClose={() => setShowImport(false)}
          onImported={() => {
            setShowImport(false);
            setLoading(true);
            actionListAgents().finally(() => setLoading(false));
          }}
          doImport={(input) => httpImportAgent(input)}
        />
      )}

      {showCreate && (
        <CreateAgentModal
          onCancel={() => setShowCreate(false)}
          onCreated={(agent, openTab) => {
            setShowCreate(false);
            actionListAgents({}).catch(() => {});
            navigate(`/app/admin/agents/${agent.id}/settings${openTab ? `?tab=${encodeURIComponent(openTab)}` : ''}`);
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
  onExport: (format: 'json' | 'zip') => void;
}> = ({ agent, cardMode, onOpen, onDelete, onClone, onExport }) => {
  const { t } = useTranslation();
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

      {(agent.categories || []).some(isAgentCategory) && (
        <div className="flex flex-wrap gap-1">
          {(agent.categories || []).filter(isAgentCategory).map((c) => (
            <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
              {t(AGENT_CATEGORY_LABEL_KEYS[c])}
            </span>
          ))}
        </div>
      )}

      <dl className="text-xs text-gray-600 grid grid-cols-2 gap-x-2 gap-y-0.5">
        <div>
          <dt className="inline text-gray-400">{t('adminAgents.updatedLabel')}</dt>
          <dd className="inline">{fmtDate(agent.updatedAt) || '—'}</dd>
        </div>
        <div>
          <dt className="inline text-gray-400">{t('adminAgents.createdLabel')}</dt>
          <dd className="inline">{fmtDate(agent.createdAt) || '—'}</dd>
        </div>
        <div>
          <dt className="inline text-gray-400">{t('adminAgents.ragLabel')}</dt>
          <dd className="inline">{fmtBytes(agent.totalSiteSourceSize)}</dd>
        </div>
        <div>
          <dt className="inline text-gray-400">{t('adminAgents.deployedLabel')}</dt>
          <dd className="inline">{typeof agent.botInstancesCount === 'number' ? `${agent.botInstancesCount} ${agent.botInstancesCount === 1 ? t('adminAgents.appSingular') : t('adminAgents.appPlural')}` : '—'}</dd>
        </div>
      </dl>

      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        {/* The settings page renders editable fields for the owner, read-only
            for everyone else. The verb on this button matches what the viewer
            will actually see when they land there. */}
        <button onClick={onOpen} className="text-xs text-brand-500 hover:underline">
          {isOwned ? t('adminAgents.edit') : t('adminAgents.view')}
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
              {t('adminAgents.cloneToMyAgents')}
            </button>
          </>
        )}
        {/* Export is available to anyone who can see the agent (owners always,
            public-others because the bundle holds nothing private). Backend
            enforces final authz. */}
        <span className="text-gray-300">|</span>
        <button onClick={() => onExport('json')} className="text-xs text-brand-500 hover:underline">
          {t('adminAgents.exportJson')}
        </button>
        <span className="text-gray-300">|</span>
        <button onClick={() => onExport('zip')} className="text-xs text-brand-500 hover:underline">
          {t('adminAgents.exportZip')}
        </button>
        {isOwned && (
          <>
            <span className="text-gray-300">|</span>
            <button onClick={onDelete} className="text-xs text-red-500 hover:underline">
              {t('adminAgents.delete')}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Clone a public agent into "My agents". When the source has indexed knowledge
// (a persona's works, a support agent's site) the clone can take it along: the
// pages, documents and embeddings are copied into one of the user's apps,
// without re-indexing.
const CloneAgentModal: React.FC<{ agent: ModelAgent; onClose: () => void }> = ({ agent, onClose }) => {
  const { t } = useTranslation();
  const ownedApps = useAppStore((s) => s.ownedApps);
  const hasKnowledge = (agent.totalSiteSourceSize || 0) > 0;
  const [displayName, setDisplayName] = useState(agent.displayName || '');
  const [includeKnowledge, setIncludeKnowledge] = useState(hasKnowledge);
  const [ownerAppId, setOwnerAppId] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ownedApps.length) actionLoadOwnedApps().catch(() => {});
  }, [ownedApps.length]);
  useEffect(() => {
    if (!ownerAppId && ownedApps.length) setOwnerAppId(ownedApps[0]._id);
  }, [ownedApps, ownerAppId]);

  const needsApp = hasKnowledge && includeKnowledge;
  const canSubmit = !busy && displayName.trim().length > 0 && (!needsApp || !!ownerAppId);

  async function submit() {
    setBusy(true);
    try {
      const { knowledge } = await actionCloneAgent(agent.id, {
        displayName: displayName.trim(),
        ...(needsApp ? { includeKnowledge: true, ownerAppId } : {}),
      });
      toast.success(`${t('adminAgents.clonedToastPrefix')} "${agent.displayName}" ${t('adminAgents.clonedToastSuffix')}`);
      if (knowledge?.copied) {
        toast.info(
          t('adminAgents.cloneKnowledgeCopied')
            .replace('{sites}', String(knowledge.sites ?? 0))
            .replace('{docs}', String(knowledge.docs ?? 0))
        );
      } else if (knowledge) {
        toast.warn(t('adminAgents.cloneKnowledgeNotCopied').replace('{reason}', knowledge.reason || ''));
      }
      await actionListAgents({}); // refresh the store so the clone appears in My agents
      onClose();
    } catch (e: any) {
      toast.error(`${t('adminAgents.cloneFailedPrefix')} ${e?.response?.data?.error || e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog" aria-label={t('adminAgents.cloneModalTitle')}>
      <div className="bg-white rounded-xl p-5 w-[480px] max-w-[90%] space-y-3">
        <h3 className="text-lg font-semibold">{t('adminAgents.cloneModalTitle')}</h3>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 mb-1">{t('adminAgents.cloneNameLabel')}</span>
          <input className="border rounded px-2 py-1 w-full" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </label>
        {hasKnowledge && (
          <div className="space-y-2">
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={includeKnowledge} onChange={(e) => setIncludeKnowledge(e.target.checked)} />
              <span>
                {t('adminAgents.cloneIncludeKnowledge').replace('{size}', fmtBytes(agent.totalSiteSourceSize))}
                <span className="block text-xs text-gray-500">{t('adminAgents.cloneIncludeKnowledgeHint')}</span>
              </span>
            </label>
            {includeKnowledge && (
              ownedApps.length ? (
                <label className="block">
                  <span className="block text-xs font-semibold text-gray-600 mb-1">{t('adminAgents.cloneHomeAppLabel')}</span>
                  <select className="border rounded px-2 py-1 w-full" value={ownerAppId} onChange={(e) => setOwnerAppId(e.target.value)}>
                    {ownedApps.map((a) => (
                      <option key={a._id} value={a._id}>{a.displayName}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="text-xs text-amber-700">{t('adminAgents.cloneNoAppHint')}</div>
              )
            )}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="border rounded px-4 py-2 text-sm hover:bg-gray-100">
            {t('adminAgents.cloneCancel')}
          </button>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
          >
            {t('adminAgents.cloneSubmit')}
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateAgentModal: React.FC<{
  onCancel: () => void;
  onCreated: (agent: ModelAgent, openTab?: string) => void;
}> = ({ onCancel, onCreated }) => {
  const { t } = useTranslation();
  const ownedApps = useAppStore((s) => s.ownedApps);
  const agents = useAppStore((s) => s.agents);
  const currentUserId = useAppStore((s) => s.currentUser?._id);
  // Public agents from others are the templates: customer-support ones first,
  // since that is what most new agents are for.
  const templates = useMemo(
    () =>
      agents
        .filter((a) => a.visibility === 'public' && a.ownerId !== currentUserId)
        .sort((a, b) => Number((b.categories || []).includes('customer-support')) - Number((a.categories || []).includes('customer-support'))),
    [agents, currentUserId]
  );
  const [templateId, setTemplateId] = useState('');
  const template = templates.find((a) => a.id === templateId) || null;
  const [displayName, setDisplayName] = useState('New AI Agent');
  const [bio, setBio] = useState('');
  const [prompt, setPrompt] = useState('You are a helpful assistant.');
  const [visibility, setVisibility] = useState<'private' | 'unlisted' | 'public'>('private');
  const [ownerAppId, setOwnerAppId] = useState('');
  const [includeKnowledge, setIncludeKnowledge] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ownedApps.length) actionLoadOwnedApps().catch(() => {});
  }, [ownedApps.length]);
  useEffect(() => {
    if (!ownerAppId && ownedApps.length) setOwnerAppId(ownedApps[0]._id);
  }, [ownedApps, ownerAppId]);

  const pickTemplate = (id: string) => {
    setTemplateId(id);
    const tpl = templates.find((a) => a.id === id);
    setDisplayName(tpl ? tpl.displayName : 'New AI Agent');
  };

  const create = async () => {
    setBusy(true);
    try {
      if (template) {
        const withKnowledge = includeKnowledge && (template.totalSiteSourceSize || 0) > 0;
        const { agent } = await actionCloneAgent(template.id, {
          displayName: displayName.trim() || template.displayName,
          ...(ownerAppId ? { ownerAppId } : {}),
          ...(withKnowledge ? { includeKnowledge: true } : {}),
        });
        // A support agent is only as good as its knowledge of your business:
        // land on the Web Index so adding your own site is the next step.
        if (agent) onCreated(agent, (template.categories || []).includes('customer-support') ? 'Web Index' : undefined);
      } else {
        const created = await actionCreateAgent({ displayName, bio, prompt, visibility, ownerAppId: ownerAppId || undefined });
        if (created) onCreated(created);
      }
    } catch (e) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      toast.error(`${t('adminAgents.createFailedPrefix')} ${err.response?.data?.error || err.message || ''}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog" aria-label={t('adminAgents.createModalTitle')}>
      <div className="bg-white rounded-xl p-5 w-[560px] max-w-[92%] max-h-[90vh] overflow-y-auto space-y-3">
        <h3 className="text-lg font-semibold">{t('adminAgents.createModalTitle')}</h3>

        <fieldset className="space-y-1">
          <legend className="block text-xs font-semibold text-gray-600 mb-1">{t('adminAgents.startFromLabel')}</legend>
          <div className="max-h-56 overflow-y-auto border rounded-lg divide-y">
            <label className="flex items-start gap-2 p-2 cursor-pointer hover:bg-gray-50">
              <input type="radio" name="start-from" className="mt-1" checked={!template} onChange={() => pickTemplate('')} />
              <span>
                <span className="block text-sm font-semibold">{t('adminAgents.startBlank')}</span>
                <span className="block text-xs text-gray-500">{t('adminAgents.startBlankDesc')}</span>
              </span>
            </label>
            {templates.map((a) => (
              <label key={a.id} className="flex items-start gap-2 p-2 cursor-pointer hover:bg-gray-50">
                <input type="radio" name="start-from" className="mt-1" checked={templateId === a.id} onChange={() => pickTemplate(a.id)} />
                {a.avatarUrl ? (
                  <img src={a.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">{(a.displayName || 'AI').slice(0, 2).toUpperCase()}</span>
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-semibold truncate">{a.displayName}</span>
                  <span className="flex flex-wrap gap-1">
                    {(a.categories || []).filter(isAgentCategory).map((c) => (
                      <span key={c} className="text-[10px] px-1.5 rounded-full bg-gray-100 text-gray-700">{t(AGENT_CATEGORY_LABEL_KEYS[c])}</span>
                    ))}
                  </span>
                  {a.bio && <span className="block text-xs text-gray-500 line-clamp-2">{a.bio}</span>}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="block text-xs font-semibold text-gray-600 mb-1">{t('adminAgents.displayNameLabel')}</span>
          <input className="border rounded px-2 py-1 w-full" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </label>

        {ownedApps.length > 0 && (
          <label className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1">{t('adminAgents.homeAppLabel')}</span>
            <select className="border rounded px-2 py-1 w-full" value={ownerAppId} onChange={(e) => setOwnerAppId(e.target.value)}>
              {ownedApps.map((a) => (
                <option key={a._id} value={a._id}>{a.displayName}</option>
              ))}
            </select>
          </label>
        )}

        {template ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-600">{t('adminAgents.templateHint')}</p>
            {(template.totalSiteSourceSize || 0) > 0 && (
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1" checked={includeKnowledge} onChange={(e) => setIncludeKnowledge(e.target.checked)} />
                <span>{t('adminAgents.cloneIncludeKnowledge').replace('{size}', fmtBytes(template.totalSiteSourceSize))}</span>
              </label>
            )}
          </div>
        ) : (
          <>
            <label className="block">
              <span className="block text-xs font-semibold text-gray-600 mb-1">{t('adminAgents.bioLabel')}</span>
              <textarea className="border rounded px-2 py-1 w-full" rows={2} value={bio} onChange={(e) => setBio(e.target.value)} />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-gray-600 mb-1">{t('adminAgents.initialPromptLabel')}</span>
              <textarea className="border rounded px-2 py-1 w-full font-mono text-sm" rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-gray-600 mb-1">{t('adminAgents.visibilityLabel')}</span>
              <select className="border rounded px-2 py-1" value={visibility} onChange={(e) => setVisibility(e.target.value as 'private' | 'unlisted' | 'public')}>
                <option value="private">{t('adminAgents.visibilityPrivate')}</option>
                <option value="unlisted">{t('adminAgents.visibilityUnlistedInviteByAddress')}</option>
                <option value="public">{t('adminAgents.visibilityPublic')}</option>
              </select>
            </label>
            {/* Public is platform-wide visible. Operators who skim through "+ New
                Agent" defaults sometimes pick Public for an internal-only persona
                without realising other tenants will see it in their AI Agents
                list and be able to clone it. Make the trade-off explicit at
                create time so this is a deliberate choice. */}
            {visibility === 'public' && (
              <div className="rounded-md border border-yellow-300 bg-yellow-50 p-2 text-xs text-yellow-900 leading-snug dark:border-yellow-800/60 dark:bg-yellow-900/30 dark:text-yellow-200">
                <strong>{t('adminAgents.publicVisibilityWarningTitle')}</strong>{' '}
                {t('adminAgents.publicVisibilityWarningBody')}
              </div>
            )}
          </>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} disabled={busy} className="border rounded px-4 py-2 hover:bg-gray-100">{t('adminAgents.cancel')}</button>
          <button
            disabled={busy || !displayName.trim()}
            onClick={create}
            className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {busy ? t('adminAgents.creating') : t('adminAgents.create')}
          </button>
        </div>
      </div>
    </div>
  );
};
