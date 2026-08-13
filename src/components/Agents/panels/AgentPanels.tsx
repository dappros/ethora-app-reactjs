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
  alreadyIndexedUrl,
  httpDeleteDocSourceV2,
  httpDeleteSiteSourceV2Url,
  httpDiagAgentBotInstance,
  httpLeaveChatAgentBotInstance,
  httpListAgentBotInstances,
  httpListDocSourcesV2,
  httpListSiteSourcesV2,
  httpPostFile,
  httpReindexSiteSourceV2,
  httpTestMessageAgentBotInstance,
} from '../../../http';
import { useTranslation } from '../../../i18n/useTranslation';
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
  const { t } = useTranslation();
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
      toast.success(t('agentPanels.saved'));
    } catch (e: any) {
      toast.error(`${t('agentPanels.saveFailedPrefix')} ${e?.response?.data?.error || e.message}`);
    }
  }

  const avatarFileRef = useRef<HTMLInputElement>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

  // Avatar upload flow mirrors how regular user profile images work: POST /v1/files
  // (multipart), take the returned `results[0].location` URL, and stick it on the agent.
  // Saved inline so the UI reflects the new avatar without waiting for a second click.
  async function uploadAvatar(file: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('agentPanels.selectImageFile'));
      return;
    }
    setAvatarBusy(true);
    try {
      const resp = await httpPostFile(file);
      const location = resp.data?.results?.[0]?.location;
      if (!location) throw new Error('Upload returned no location');
      setAvatarUrl(location);
      await actionUpdateAgent(agent.id, { avatarUrl: location });
      toast.success(t('agentPanels.avatarUploaded'));
    } catch (e: any) {
      toast.error(`${t('agentPanels.uploadFailedPrefix')} ${e?.response?.data?.error || e.message}`);
    } finally {
      setAvatarBusy(false);
      if (avatarFileRef.current) avatarFileRef.current.value = '';
    }
  }

  async function clearAvatar() {
    if (!avatarUrl) return;
    if (!confirm(t('agentPanels.confirmRemoveAvatar'))) return;
    setAvatarBusy(true);
    try {
      setAvatarUrl('');
      await actionUpdateAgent(agent.id, { avatarUrl: '' });
      toast.success(t('agentPanels.avatarCleared'));
    } catch (e: any) {
      toast.error(`${t('agentPanels.clearFailedPrefix')} ${e?.response?.data?.error || e.message}`);
    } finally {
      setAvatarBusy(false);
    }
  }

  return (
    <div className="space-y-3 max-w-2xl">
      <Field label={t('agentPanels.displayNameLabel')}>
        <input className="border rounded px-2 py-1 w-full" disabled={isDisabled} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </Field>
      <Field label={t('agentPanels.avatarLabel')}>
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover border" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-100 border flex items-center justify-center text-gray-400 text-xs">
              {t('agentPanels.noAvatar')}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <input
              ref={avatarFileRef}
              type="file"
              accept="image/*"
              disabled={isDisabled || avatarBusy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadAvatar(f);
              }}
              className="text-xs"
            />
            <div className="flex items-center gap-2">
              {avatarUrl && (
                <button
                  type="button"
                  disabled={isDisabled || avatarBusy}
                  onClick={clearAvatar}
                  className="text-xs text-red-500 hover:underline disabled:opacity-50"
                >
                  {t('agentPanels.remove')}
                </button>
              )}
              {avatarBusy && <span className="text-xs text-gray-500">{t('agentPanels.uploading')}</span>}
            </div>
          </div>
        </div>
      </Field>
      {/* Advanced: raw URL still editable for operators who already have a hosted image.
          Hidden-ish via small muted font; saving still happens on "Save persona". */}
      <Field label={t('agentPanels.avatarUrlAdvancedLabel')}>
        <input className="border rounded px-2 py-1 w-full text-xs font-mono" disabled={isDisabled} value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
      </Field>
      <Field label={t('agentPanels.bioLabel')}>
        <textarea className="border rounded px-2 py-1 w-full" rows={3} disabled={isDisabled} value={bio} onChange={(e) => setBio(e.target.value)} />
      </Field>
      <Field label={t('agentPanels.responseModeLabel')}>
        <select className="border rounded px-2 py-1" disabled={isDisabled} value={responseMode} onChange={(e) => setResponseMode(e.target.value as any)}>
          <option value="always">{t('agentPanels.responseModeAlways')}</option>
          <option value="mentioned">{t('agentPanels.responseModeMentioned')}</option>
          <option value="smart">{t('agentPanels.responseModeSmart')}</option>
          <option value="probability">{t('agentPanels.responseModeProbability')}</option>
        </select>
      </Field>
      {responseMode === 'probability' && (
        <Field label={t('agentPanels.probabilityLabel').replace('{pct}', (responseProbability * 100).toFixed(0))}>
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
      <Field label={t('agentPanels.cooldownLabel')}>
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
        {t('agentPanels.savePersona')}
      </button>
    </div>
  );
};

export const ContextPanel: React.FC<{ agent: ModelAgent; isDisabled?: boolean }> = ({ agent, isDisabled }) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState(agent.prompt);
  useEffect(() => setPrompt(agent.prompt), [agent.id]);
  return (
    <div className="space-y-3 max-w-3xl">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">{t('agentPanels.templatesLabel')}</span>
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
            toast.success(t('agentPanels.contextSaved'));
          } catch (e: any) {
            toast.error(`${t('agentPanels.saveFailedPrefix')} ${e?.response?.data?.error || e.message}`);
          }
        }}
        disabled={isDisabled}
        className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {t('agentPanels.saveContext')}
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

// Page size for the Web Index table. The backend caps `limit` at 500; 25 keeps the
// panel scrollable without pagination controls dominating a small index.
const SITE_SOURCES_PAGE_SIZE = 25;

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
  const { t } = useTranslation();
  const apps = useAppStore((s) => s.apps);
  // Only the user's own apps are eligible scopes (anything else and the auth check
  // on /v2/apps/:appId/sources/* would 403).
  if (apps.length <= 1) return null;
  return (
    <label className="flex items-center gap-2 text-xs text-gray-600">
      <span>{t('agentPanels.scopeAppLabel')}</span>
      <select
        className="border rounded px-2 py-1 text-xs"
        value={appId}
        onChange={(e) => onChange(e.target.value)}
      >
        {!appId && <option value="">{t('agentPanels.pickAnApp')}</option>}
        {apps.map((a) => (
          <option key={a._id} value={a._id}>
            {a.displayName}{a._id === agent.originAppId ? t('agentPanels.originSuffix') : ''}
          </option>
        ))}
      </select>
    </label>
  );
};

export const WebIndexPanel: React.FC<{ agent: ModelAgent; appId: string; isDisabled?: boolean }> = ({ agent, appId: initialAppId, isDisabled }) => {
  const { t } = useTranslation();
  const apps = useAppStore((s) => s.apps);
  const [appId, setAppId] = useState<string>(initialAppId);
  const [url, setUrl] = useState('');
  const [followLink, setFollowLink] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<SiteSourceRow[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [offset, setOffset] = useState(0);
  // Server-side total, not rows.length — a crawl can leave far more rows than one page.
  const [total, setTotal] = useState(0);

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

  // Takes the offset explicitly: callers that move between pages or drop the last row
  // of a page need the fetch to use the new offset without waiting for a re-render.
  const loadList = async (nextOffset = offset) => {
    if (!appId) {
      setRows([]);
      setTotal(0);
      return;
    }
    setLoadingList(true);
    try {
      const r = await httpListSiteSourcesV2(appId, { limit: SITE_SOURCES_PAGE_SIZE, offset: nextOffset });
      // Endpoint returns { result: SiteSourceRow[], pagination: { total, limit, offset, hasMore } } in v2.
      const items: SiteSourceRow[] = r.data?.result || r.data?.items || [];
      setRows(items);
      // Older backends have no pagination block; total then degrades to the page length,
      // which still renders a sane (if truncated) count rather than 0.
      setTotal(Number(r.data?.pagination?.total ?? items.length));
      setOffset(nextOffset);
    } catch (e: any) {
      toast.error(`${t('agentPanels.failedToLoadUrlsPrefix')} ${e?.response?.data?.error || e.message}`);
      setRows([]);
      setTotal(0);
    } finally {
      setLoadingList(false);
    }
  };
  // Switching app scope invalidates the current page position.
  useEffect(() => {
    loadList(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  // Removing the last row of a non-first page would otherwise strand the user on an
  // empty page, so step back one page in that case.
  const reloadAfterRowRemoved = () => {
    const stayOnPage = rows.length > 1 || offset === 0;
    return loadList(stayOnPage ? offset : Math.max(0, offset - SITE_SOURCES_PAGE_SIZE));
  };

  const crawlOnce = async (force: boolean) => {
    await httpAgentSiteCrawl(appId, agent.id, url, followLink, force);
    toast.success(t('agentPanels.crawlQueued'));
    setUrl('');
    // Re-fetch from the first page: new rows sort newest-first, so they
    // land at the top regardless of where the operator was paging.
    await loadList(0);
  };

  const handleCrawl = async () => {
    setBusy(true);
    try {
      try {
        await crawlOnce(false);
      } catch (e) {
        // A URL already in this app's list is a prompt, not a failure: offer the
        // overwrite instead of making the operator delete the row first. Declining
        // leaves the URL in the input, so it can be edited rather than retyped.
        const indexedUrl = alreadyIndexedUrl(e, url);
        if (indexedUrl === null) throw e;
        if (!confirm(t('agentPanels.confirmRecrawlIndexed').replace('{url}', indexedUrl))) return;
        await crawlOnce(true);
      }
    } catch (e: any) {
      toast.error(`${t('agentPanels.crawlFailedPrefix')} ${e?.response?.data?.error || e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = offset + rows.length;
  const hasPrev = offset > 0;
  const hasNext = pageEnd < total;

  return (
    <div className="space-y-3 max-w-3xl">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm text-gray-600">
          {t('agentPanels.webIndexDescription')}
          {!appId && (
            <div className="mt-1 text-xs text-amber-600">
              {t('agentPanels.noAppPicked')}
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
          {t('agentPanels.followLinks')}
        </label>
        <button
          disabled={isDisabled || busy || !url || !appId}
          onClick={handleCrawl}
          className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {busy ? t('agentPanels.crawling') : t('agentPanels.crawl')}
        </button>
      </div>

      <div className="text-xs text-gray-500">
        {t('agentPanels.indexedBytesPrefix')} {agent.totalSiteSourceSize?.toLocaleString() || 0}
        {appId && (
          <> · {total.toLocaleString()} {total === 1 ? t('agentPanels.indexedUrlsSuffixOne') : t('agentPanels.indexedUrlsSuffixOther')}</>
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
              <th className="text-left p-2">{t('agentPanels.urlHeader')}</th>
              <th className="text-left p-2 w-24">{t('agentPanels.sizeHeader')}</th>
              <th className="text-left p-2 w-32">{t('agentPanels.updatedHeader')}</th>
              <th className="p-2 w-28"></th>
            </tr>
          </thead>
          <tbody>
            {loadingList && (
              <tr><td colSpan={4} className="p-3 text-gray-500">{t('agentPanels.loading')}</td></tr>
            )}
            {!loadingList && rows.length === 0 && (
              <tr><td colSpan={4} className="p-3 text-gray-500">{t('agentPanels.noUrlsIndexed')}</td></tr>
            )}
            {!loadingList && rows.map((row) => (
              <tr key={row.id} className="border-t align-top">
                <td className="p-2">
                  <div className="font-mono break-all">{row.url}</div>
                  {row.originUrl && row.originUrl !== row.url && (
                    <div className="text-gray-400 text-[10px] mt-0.5">{t('agentPanels.viaPrefix')} {row.originUrl}</div>
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
                        toast.success(t('agentPanels.reindexQueued'));
                        await loadList(offset);
                      } catch (e: any) {
                        toast.error(`${t('agentPanels.reindexFailedPrefix')} ${e?.response?.data?.error || e.message}`);
                      }
                    }}
                    className="text-brand-500 hover:underline mr-2"
                  >
                    {t('agentPanels.reindex')}
                  </button>
                  <button
                    disabled={isDisabled || busy}
                    onClick={async () => {
                      if (!confirm(t('agentPanels.confirmRemoveFromIndex').replace('{name}', row.url))) return;
                      try {
                        await httpDeleteSiteSourceV2Url(appId, row.id);
                        toast.success(t('agentPanels.removed'));
                        await reloadAfterRowRemoved();
                      } catch (e: any) {
                        toast.error(`${t('agentPanels.removeFailedPrefix')} ${e?.response?.data?.error || e.message}`);
                      }
                    }}
                    className="text-red-500 hover:underline"
                  >
                    {t('agentPanels.remove')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hidden while everything fits on one page — a single-page index needs no controls. */}
      {(hasPrev || hasNext) && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {t('agentPanels.paginationRange')
              .replace('{from}', String(pageStart))
              .replace('{to}', String(pageEnd))
              .replace('{total}', total.toLocaleString())}
          </span>
          <div className="flex gap-2">
            <button
              disabled={!hasPrev || loadingList}
              onClick={() => loadList(Math.max(0, offset - SITE_SOURCES_PAGE_SIZE))}
              className="border rounded px-3 py-1 disabled:opacity-40"
            >
              {t('agentPanels.previousPage')}
            </button>
            <button
              disabled={!hasNext || loadingList}
              onClick={() => loadList(offset + SITE_SOURCES_PAGE_SIZE)}
              className="border rounded px-3 py-1 disabled:opacity-40"
            >
              {t('agentPanels.nextPage')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

type DocSourceRow = {
  id: string;
  originalName: string;
  title?: string;
  mimeType?: string;
  size: number;
  createdAt?: string;
  updatedAt?: string;
};

export const DocsIndexPanel: React.FC<{ agent: ModelAgent; appId: string; isDisabled?: boolean }> = ({ agent, appId: initialAppId, isDisabled }) => {
  const { t } = useTranslation();
  const apps = useAppStore((s) => s.apps);
  const fileRef = useRef<HTMLInputElement>(null);
  const [appId, setAppId] = useState<string>(initialAppId);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<DocSourceRow[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    if (!appId && apps.length > 0) setAppId(apps[0]._id);
  }, [apps, appId]);
  useEffect(() => {
    if (initialAppId && initialAppId !== appId) setAppId(initialAppId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAppId]);

  const loadList = async () => {
    if (!appId) return;
    setLoadingList(true);
    try {
      const resp = await httpListDocSourcesV2(appId);
      const result = resp?.data?.result;
      setRows(Array.isArray(result) ? result : []);
    } catch (e: any) {
      // Non-fatal: just leave rows empty + surface the error so user knows
      // why nothing's listed (was a silent gap previously - user got a
      // success toast on upload then saw an empty panel and reported a bug).
      toast.error(`${t('agentPanels.couldNotLoadDocsListPrefix')} ${e?.response?.data?.error || e.message}`);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (appId) loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  return (
    <div className="space-y-3 max-w-2xl">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm text-gray-600">
          {t('agentPanels.docsIndexDescription')}
          {!appId && (
            <div className="mt-1 text-xs text-amber-600">
              {t('agentPanels.noAppPicked')}
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
            toast.success(t('agentPanels.uploadedFilesToast').replace('{n}', String(files.length)));
            await loadList();
          } catch (err: any) {
            toast.error(`${t('agentPanels.uploadFailedPrefix')} ${err?.response?.data?.error || err.message}`);
          } finally {
            setBusy(false);
            if (fileRef.current) fileRef.current.value = '';
          }
        }}
      />
      {busy && <div className="text-sm text-gray-500">{t('agentPanels.uploadingParsingEmbedding')}</div>}

      {/* Indexed files list - this used to be missing entirely, so users
          got a 'success' toast on upload but saw no confirmation that the
          file landed. Includes a delete affordance per row. */}
      <div className="border rounded">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">{t('agentPanels.fileHeader')}</th>
              <th className="text-left p-2 w-24">{t('agentPanels.sizeHeader')}</th>
              <th className="text-left p-2 w-32">{t('agentPanels.uploadedHeader')}</th>
              <th className="p-2 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {loadingList && (
              <tr><td colSpan={4} className="p-3 text-gray-500">{t('agentPanels.loading')}</td></tr>
            )}
            {!loadingList && rows.length === 0 && (
              <tr><td colSpan={4} className="p-3 text-gray-500">{t('agentPanels.noFilesIndexed')}</td></tr>
            )}
            {!loadingList && rows.map((row) => (
              <tr key={row.id} className="border-t align-top">
                <td className="p-2 break-all">{row.originalName || row.title || row.id}</td>
                <td className="p-2 text-gray-600">{fmtBytesShort(row.size)}</td>
                <td className="p-2 text-gray-500">{row.createdAt ? new Date(row.createdAt).toLocaleString() : ''}</td>
                <td className="p-2 text-right whitespace-nowrap">
                  <button
                    disabled={isDisabled || busy}
                    onClick={async () => {
                      if (!confirm(t('agentPanels.confirmRemoveFromIndex').replace('{name}', row.originalName || row.title || row.id))) return;
                      try {
                        await httpDeleteDocSourceV2(appId, row.id);
                        toast.success(t('agentPanels.removed'));
                        await loadList();
                      } catch (e: any) {
                        toast.error(`${t('agentPanels.removeFailedPrefix')} ${e?.response?.data?.error || e.message}`);
                      }
                    }}
                    className="text-red-500 hover:underline"
                  >
                    {t('agentPanels.remove')}
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

export const SoulMdPanel: React.FC<{ agent: ModelAgent; isDisabled?: boolean }> = ({ agent, isDisabled }) => {
  const { t } = useTranslation();
  const [soul, setSoul] = useState(agent.soulMd);
  useEffect(() => setSoul(agent.soulMd), [agent.id]);
  return (
    <div className="space-y-3 max-w-3xl">
      <div className="text-sm text-gray-600">
        {t('agentPanels.soulMdDescriptionPrefix')} {agent.soulMdUpdatedAt || t('agentPanels.never')} ({agent.soulMdUpdatedBy || t('agentPanels.notApplicable')})
      </div>
      <textarea className="border rounded px-2 py-2 w-full font-mono text-sm" rows={16} disabled={isDisabled} value={soul} onChange={(e) => setSoul(e.target.value)} />
      <div className="flex gap-2">
        <button
          onClick={async () => {
            try {
              await actionUpdateAgentSoul(agent.id, { soulMd: soul });
              toast.success(t('agentPanels.soulMdSaved'));
            } catch (e: any) {
              toast.error(`${t('agentPanels.failedPrefix')} ${e?.response?.data?.error || e.message}`);
            }
          }}
          disabled={isDisabled}
          className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {t('agentPanels.saveSoulMd')}
        </button>
      </div>
    </div>
  );
};

export const HeartbeatPanel: React.FC<{ agent: ModelAgent; isDisabled?: boolean }> = ({ agent, isDisabled }) => {
  const { t } = useTranslation();
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
        {t('agentPanels.heartbeatDescription')}
      </div>
      <Field label={t('agentPanels.enabledLabel')}>
        <input type="checkbox" disabled={isDisabled} checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
      </Field>
      <Field label={t('agentPanels.scheduleLabel')}>
        <input className="border rounded px-2 py-1 w-full" disabled={isDisabled} placeholder="e.g. '0 9 * * MON-FRI' or 'inactive 1h'" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
      </Field>
      <Field label={t('agentPanels.heartbeatPromptLabel')}>
        <textarea className="border rounded px-2 py-1 w-full" rows={5} disabled={isDisabled} value={hbPrompt} onChange={(e) => setHbPrompt(e.target.value)} />
      </Field>
      <button
        onClick={async () => {
          try {
            await actionUpdateAgent(agent.id, { heartbeat: { enabled, schedule, prompt: hbPrompt } });
            toast.success(t('agentPanels.heartbeatSaved'));
          } catch (e: any) {
            toast.error(`${t('agentPanels.failedPrefix')} ${e?.response?.data?.error || e.message}`);
          }
        }}
        disabled={isDisabled}
        className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {t('agentPanels.saveHeartbeat')}
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
  const { t } = useTranslation();
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
    return <span className="text-gray-500 text-xs">{t('agentPanels.none')}</span>;
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
                    toast.success(t('agentPanels.testSentToast').replace('{title}', r.title));
                  } else {
                    toast.warn(`${t('agentPanels.sentFailedPrefix')} ${data?.results?.[0]?.error || data?.message || 'unknown'}`);
                  }
                } catch (e: any) {
                  const data = e?.response?.data;
                  toast.error(`${t('agentPanels.testFailedPrefix')} ${data?.message || data?.error || e.message}`);
                } finally {
                  setBusy(null);
                }
              }}
              className="text-[11px] border rounded px-2 py-0.5 hover:bg-gray-100 disabled:opacity-50"
              title={t('agentPanels.testTooltip')}
            >
              {rowBusy ? '...' : t('agentPanels.test')}
            </button>
            <button
              disabled={rowBusy}
              onClick={async () => {
                if (!confirm(t('agentPanels.confirmRemoveFromRoom').replace('{name}', agent.displayName || t('agentPanels.agentFallback')).replace('{title}', r.title))) return;
                setBusy(r.jid);
                try {
                  await httpLeaveChatAgentBotInstance(agent.id, bi.id, r.jid);
                  toast.success(t('agentPanels.leftToast').replace('{title}', r.title));
                  onChanged?.();
                } catch (e: any) {
                  toast.error(`${t('agentPanels.leaveFailedPrefix')} ${e?.response?.data?.error || e.message}`);
                } finally {
                  setBusy(null);
                }
              }}
              className="text-[11px] border rounded px-2 py-0.5 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              title={t('agentPanels.leaveTooltip')}
            >
              {t('agentPanels.leave')}
            </button>
            {/* Show the JID as a faint hint - useful for diagnostics, not for everyday use */}
            <span className="font-mono text-[9px] text-gray-400 break-all hidden lg:inline">{r.jid}</span>
          </li>
        );
      })}
    </ul>
  );
};

const DiagRow: React.FC<{ agent: ModelAgent; bi: AgentBotInstance; onChanged?: () => void; isDisabled?: boolean }> = ({ agent, bi, onChanged, isDisabled }) => {
  const { t } = useTranslation();
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
    ? t('agentPanels.diagNotLoaded')
    : !inMem?.spawned
      ? t('agentPanels.diagNoXmppClient')
      : !inMem?.online
        ? `${t('agentPanels.diagSpawnedNotOnlinePrefix')}${inMem?.lastError ? ': ' + inMem.lastError : ''}`
        : (inMem?.joinedRooms?.length || 0) === 0
          ? t('agentPanels.diagOnlineNotInRoom')
          : t('agentPanels.diagOnlineInMuc');

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
                ? t('agentPanels.botOnTitle')
                : t('agentPanels.botOffTitle')
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
          {/* Inspect surfaces the bot's live ai-service runtime state +
              recent message/response pairs. That's privileged info — it
              would let a non-owner viewer (e.g. a cross-tenant superadmin
              audit, or anyone browsing public agents) read chat content
              from another tenant's rooms. Gate it on ownership; non-
              owners just see the row identity. */}
          {isDisabled ? (
            <span
              className="text-xs text-gray-400 cursor-not-allowed"
              title={t('agentPanels.inspectDisabledTooltip')}
            >
              {t('agentPanels.inspectDisabled')}
            </span>
          ) : (
            <button
              onClick={() => setOpen(!open)}
              className="text-xs text-brand-500 hover:underline"
            >
              {open ? t('agentPanels.hide') : t('agentPanels.inspect')}
            </button>
          )}
        </td>
      </tr>
      {open && (
        <tr className="border-t bg-gray-50">
          <td colSpan={5} className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={refresh} disabled={loading} className="text-xs border rounded px-2 py-1 hover:bg-gray-100">
                {loading ? t('agentPanels.refreshing') : t('agentPanels.refresh')}
              </button>
              {diag?.aiServiceError && (
                <span className="text-xs text-red-600">{t('agentPanels.aiServiceErrorPrefix')} {diag.aiServiceError}</span>
              )}
            </div>
            {diag && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="font-semibold mb-1">{t('agentPanels.inMemoryHeading')}</div>
                  <dl className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    <DiagItem label={t('agentPanels.spawnedLabel')} value={String(inMem?.spawned ?? false)} />
                    <DiagItem label={t('agentPanels.onlineLabel')} value={String(inMem?.online ?? false)} />
                    <DiagItem label={t('agentPanels.joinedRoomsXmppLabel')} value={String(inMem?.joinedRooms?.length ?? 0)} />
                    <DiagItem label={t('agentPanels.pendingRoomsLabel')} value={String(inMem?.pendingRooms?.length ?? 0)} />
                    <DiagItem label={t('agentPanels.responseModeLabelShort')} value={inMem?.responseMode || inMem?.trigger || t('agentPanels.defaultFallback')} />
                    <DiagItem label={t('agentPanels.ragLabel')} value={String(inMem?.isRAG ?? false)} />
                    <DiagItem label={t('agentPanels.cooldownSecLabel')} value={String(inMem?.cooldownSec ?? 0)} />
                    <DiagItem label={t('agentPanels.promptLengthLabel')} value={String(inMem?.promptLength ?? 0)} />
                    <DiagItem label={t('agentPanels.lastErrorLabel')} value={inMem?.lastError || '—'} />
                  </dl>
                  {(inMem?.joinedRooms || []).length > 0 && (
                    <div className="mt-2">
                      <div className="text-gray-500 mb-1">{t('agentPanels.xmppJoinedRoomsLabel')}</div>
                      {inMem.joinedRooms.map((r: string) => (
                        <div key={r} className="font-mono text-[10px] break-all">{r}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold mb-1">{t('agentPanels.lastConversationsHeading')}</div>
                  {(diag.aiService?.conversations || []).length === 0 ? (
                    <div className="text-gray-500">
                      {t('agentPanels.noneRecordedYet')}
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
  isDisabled?: boolean;
}> = ({ agent, defaultChatRooms, scopedAppId, isDisabled }) => {
  const { t } = useTranslation();
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
        {t('agentPanels.chatsIndexDescription')}
      </div>
      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 w-1/4">{t('agentPanels.appHeader')}</th>
              <th
                className="text-left p-2 w-28"
                title={t('agentPanels.botInAppTooltip')}
              >
                {t('agentPanels.botInAppHeader')}
              </th>
              <th className="text-left p-2">{t('agentPanels.roomsJoinedHeader')}</th>
              <th className="text-left p-2 w-32">{t('agentPanels.lastActiveHeader')}</th>
              <th className="p-2 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-gray-500">
                  {t('agentPanels.notDeployedYet')}
                </td>
              </tr>
            )}
            {items.map((bi) => (
              <DiagRow key={bi.id} agent={agent} bi={bi} onChanged={reload} isDisabled={isDisabled} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Optional: quick-invite the agent into a default room of the scoped App
          (only shown when this panel is rendered inside a per-App context). */}
      {scopedAppId && defaultChatRooms && defaultChatRooms.length > 0 && (
        <div className="border rounded p-3 bg-gray-50">
          <div className="text-sm font-semibold mb-2">{t('agentPanels.inviteToDefaultRoomHeading')}</div>
          <div className="flex flex-col gap-2">
            {defaultChatRooms.map((r) => (
              <button
                key={r.chatId}
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await actionInviteAgentToChat(agent.id, { appId: scopedAppId, chatId: r.chatId });
                    toast.success(t('agentPanels.invitedToast').replace('{title}', r.title));
                    reload();
                    await actionListBotInstances({ appId: scopedAppId });
                  } catch (e: any) {
                    toast.error(`${t('agentPanels.inviteFailedPrefix')} ${e?.response?.data?.error || e.message}`);
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
