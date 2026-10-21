import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ApplicationPreview } from '../components/ApplicationPreview';
import { ApplicationStarterInf } from '../components/ApplicationStarterInf';
import { IconAdd } from '../components/Icons/IconAdd';
import { Loading } from '../components/Loading.tsx';
import { NewAppModal } from '../components/modal/NewAppModal';
import { PreviewAppModal } from '../components/modal/PreviewAppModal.tsx';
import { Sorting } from '../components/Sorting';
import CsvButton from '../components/UI/Buttons/CSVButton.tsx';
import { Pagination } from '../components/UI/Pagination/Pagination.tsx';
import { useCentrifugeAppUpdater } from '../hooks/useCentrifugeAppUpdater.ts';
import { getExportAppsCsv, httpGetAppsWithStatus, httpImportApp } from '../http';
import { ImportAppModal } from '../components/modal/ImportAppModal';
import { useTranslation } from '../i18n/useTranslation';
import { ModelApp, OrderByType } from '../models';
import { useAppStore } from '../store/useAppStore';

// Thousands-separated counts ("2,056") on the lifecycle tab labels. Cached
// at module scope so each tab-toggle render doesn't reconstruct it.
const numberFormatter = new Intl.NumberFormat('en-US');

// Wait this long after the last keystroke before querying; the API caps the
// term at 100 characters.
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MAX_LENGTH = 100;

export default function AdminApps() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [showStarterInf, setShowStarterInf] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newShowModal, setNewShowModal] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState(false);
  // 'active' (default) / 'archived' (restore screen) - the new lifecycle filter
  // wired in ethora-backend 2607+. Tab persists via the URL so refresh stays put.
  const lifecycleTab = (searchParams.get('lifecycle') as 'active' | 'archived') || 'active';
  // Per-tab counts shown alongside the tab labels: "Active (22) | Archived (1)".
  // Fetched in parallel with the main list refresh via httpGetAppsWithStatus
  // (a minimal-limit call returns the same `total` we use for pagination on
  // either view; the backend rejects limit < 5, so we use 5).
  // With a search active these count matching apps only, so the tabs show
  // where the hits are.
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [archivedCount, setArchivedCount] = useState<number | null>(null);
  // Tenant-wide number of active apps (never narrowed by a search). The
  // first-run onboarding modals key off this one, so a search with no hits
  // cannot be mistaken for a tenant with no apps.
  const [tenantActiveCount, setTenantActiveCount] = useState<number | null>(null);

  const apps = useAppStore((s) => s.apps);
  const [appsState, setAppState] = useState<ModelApp[]>(apps);

  const currentUser = useAppStore((s) => s.currentUser);
  const doSetApps = useAppStore((s) => s.doSetApps);
  const currentApp = useAppStore((s) => s.currentApp as ModelApp);

  const limit = useMemo(
    () => Number(searchParams.get('limit')) || 10,
    [searchParams]
  );
  const pageIndex = useMemo(() => {
    const p = Number(searchParams.get('page')) || 1;
    return Math.max(0, p - 1);
  }, [searchParams]);
  const order = useMemo(
    () => (searchParams.get('order') as 'asc' | 'desc') || 'desc',
    [searchParams]
  );
  const orderBy = useMemo(
    () => (searchParams.get('orderBy') as OrderByType) || 'totalRegistered',
    [searchParams]
  );

  // Search term kept in the URL as ?q= so a refresh or a shared link keeps it.
  const urlQuery = searchParams.get('q') ?? '';
  const [searchInput, setSearchInput] = useState(urlQuery);
  // The last term this page wrote to the URL itself. A URL change we caused
  // must not overwrite what the user has typed since; any other change
  // (back/forward, a link) is copied into the input.
  const pushedQueryRef = useRef(urlQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Only the newest list request may update the page (typing fires several).
  const requestIdRef = useRef(0);

  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(pageIndex);

  const fetchApps = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const isStale = () => requestId !== requestIdRef.current;
    setLoading(true);
    try {
      const response = await httpGetAppsWithStatus({
        limit,
        offset: limit * pageIndex,
        order,
        orderBy,
        search: urlQuery,
        ...(lifecycleTab === 'archived' ? { status: 'archived' as const } : {}),
      });
      if (isStale()) return;

      setPageCount(Math.ceil(response.data.total / limit));
      doSetApps(response.data.apps);

      // Update the tab's own total directly from this response - the list
      // we just rendered IS the source of truth for the active tab. Then
      // make one cheap (limit=5, the backend minimum) call for the other tab's total.
      if (lifecycleTab === 'archived') {
        setArchivedCount(response.data.total ?? 0);
      } else {
        setActiveCount(response.data.total ?? 0);
        if (!urlQuery) setTenantActiveCount(response.data.total ?? 0);
      }
      try {
        const otherResp = await httpGetAppsWithStatus({
          limit: 5,
          offset: 0,
          order,
          orderBy,
          search: urlQuery,
          ...(lifecycleTab === 'archived' ? {} : { status: 'archived' as const }),
        });
        if (isStale()) return;
        if (lifecycleTab === 'archived') {
          setActiveCount(otherResp.data.total ?? 0);
          if (!urlQuery) setTenantActiveCount(otherResp.data.total ?? 0);
        } else {
          setArchivedCount(otherResp.data.total ?? 0);
        }
      } catch {
        // non-fatal: tab counts are nice-to-have; the rest of the page works without them.
      }
    } catch (error: unknown) {
      const apiError = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
      console.error(apiError || error);
    } finally {
      if (!isStale()) setLoading(false);
    }
  }, [limit, pageIndex, order, orderBy, doSetApps, lifecycleTab, urlQuery]);

  const updateSearchParams = useCallback(
    (newParams: Record<string, string | number>) => {
      setSearchParams((prev) => {
        const updatedParams = new URLSearchParams(prev);

        Object.entries(newParams).forEach(([key, value]) => {
          updatedParams.set(key, String(value));
        });

        return updatedParams;
      });
    },
    [setSearchParams]
  );

  const onPageChange = useCallback(
    (selectedItem: { selected: number }) => {
      updateSearchParams({ page: selectedItem.selected + 1 });
    },
    [updateSearchParams]
  );

  // Writes the term into the URL (replacing the history entry, so typing does
  // not pile up back-button stops) and returns to page 1.
  const applySearch = useCallback(
    (term: string) => {
      pushedQueryRef.current = term;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (term) next.set('q', term);
          else next.delete('q');
          next.set('page', '1');
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const clearSearch = useCallback(() => {
    setSearchInput('');
    applySearch('');
  }, [applySearch]);

  // URL changed by something other than this page (back/forward, a link).
  useEffect(() => {
    if (urlQuery === pushedQueryRef.current) return;
    pushedQueryRef.current = urlQuery;
    setSearchInput(urlQuery);
  }, [urlQuery]);

  // Debounced input -> URL.
  useEffect(() => {
    const term = searchInput.trim();
    if (term === pushedQueryRef.current) return;
    const timer = setTimeout(() => applySearch(term), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, applySearch]);

  const handleSortChange = useCallback(
    (newOrderBy: OrderByType, newOrder: 'asc' | 'desc') => {
      updateSearchParams({ orderBy: newOrderBy, order: newOrder, page: 1 });
    },
    [updateSearchParams]
  );

  const renderSorting = useCallback(() => {
    if (currentUser?.isSuperAdmin) {
      return (
        <Sorting<OrderByType>
          className=""
          order={order}
          setOrder={(newOrder) => handleSortChange(orderBy, newOrder)}
          orderBy={orderBy}
          setOrderBy={(newOrderBy) => handleSortChange(newOrderBy, order)}
          orderByList={[
            { key: 'displayName', title: t('adminApps.sortDisplayName') },
            { key: 'totalRegistered', title: t('adminApps.sortUsers') },
            { key: 'totalSessions', title: t('adminApps.sortSessions') },
            { key: 'totalApiCalls', title: t('adminApps.sortApi') },
            { key: 'totalTokens', title: t('adminApps.sortAi') },
            { key: 'totalFiles', title: t('adminApps.sortFiles') },
            { key: 'totalTransactions', title: t('adminApps.sortTransactions') },
            { key: 'createdAt', title: t('adminApps.sortDate') },
            { key: 'totalChats', title: t('adminApps.sortChats') },
            { key: 'lastActivityAt', title: t('adminApps.sortLastActivity') },
          ]}
        />
      );
    } else {
      return null;
    }
  }, [currentUser?.isSuperAdmin, order, orderBy, handleSortChange, t]);

  const getCsvFile = async () => {
    try {
      const response = await getExportAppsCsv();
      const binaryData = response.data;

      const blob = new Blob([binaryData], { type: 'text/csv' });

      const date = new Date();
      const formattedDate = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
      const fileName = `apps_${formattedDate}.csv`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = fileName;

      document.body.appendChild(a);
      a.click();

      if (a.parentNode) {
        a.parentNode.removeChild(a);
      }

      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    localStorage.setItem('lastPath', location.pathname + location.search);
  }, [location.pathname, location.search]);

  useEffect(() => {
    setCurrentPage(pageIndex);
  }, [pageIndex]);

  useEffect(() => {
    // Onboarding modals are only for first-time signups (the tenant has no
    // active apps at all). They previously fired whenever the current PAGE
    // was empty, which:
    //   - Triggered on the Archived tab as soon as the user restored their
    //     only archived app (the page legitimately empties, but the tenant
    //     still has many active apps).
    //   - Triggered on any out-of-range Active pagination page (e.g. /apps?page=205
    //     when the tenant has 84 pages of apps).
    //
    // Gate strictly on tenantActiveCount === 0 (the tenant-wide count returned by
    // the list endpoint) AND we're on the Active tab's first page. Anything
    // else is a normal "page happens to be empty" state and we let the empty
    // list speak for itself.
    if (lifecycleTab !== 'active' || pageIndex > 0) return;
    if (urlQuery) return; // a search with no hits is not a tenant with no apps
    if (tenantActiveCount === null) return; // wait until we know the tenant-wide count
    if (tenantActiveCount > 0) return; // tenant has apps; nothing to onboard

    const newUser = localStorage.getItem('newUser');
    if (newUser) {
      return setNewShowModal(true);
    }
    setShowModal(true);
  }, [tenantActiveCount, lifecycleTab, pageIndex, urlQuery]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  useEffect(() => {
    setAppState(apps);
  }, [apps]);

  useCentrifugeAppUpdater(setAppState);

  // useEffect(() => {
  //   if (!data) return;

  //   if (data.type === 'counter_chats') {
  //     setAppState((prev) =>
  //       prev.map((app) =>
  //         app._id === data.appId
  //           ? {
  //               ...app,
  //               stats: {
  //                 ...app.stats,
  //                 totalChats: app.stats.totalChats + 1,
  //                 recentlyChats: app.stats.recentlyChats + 1,
  //               },
  //             }
  //           : app
  //       )
  //     );
  //   }
  // }, [data]);

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      {/* Page-level header (outside the white card) - matches the Chats
          shell. The old inner 'Apps' h2 + Create App row inside the card
          and the 'Admin' / tab row above used to be the navigation chrome;
          since Apps / Agents / Billing are now sidebar items, the title +
          primary action live here on their own.
          One DOM for both layouts. Phones: title + Create on the first row,
          then full-width search, the Active / Archived segmented control and
          (super admins) sorting. Desktop: title on the left, the controls in
          one wrapping row on the right. `order-*` only reshuffles the phone
          layout; desktop keeps the DOM order. */}
      <div className="px-4 pt-4 md:pt-0 md:px-8 flex flex-wrap items-center gap-3 md:gap-4 md:min-h-[40px]">
        <div className="order-1 flex-1 md:flex-none font-varela text-[24px] md:text-[34px] leading-none">
          {t('adminApps.title')}
        </div>

        {/* `contents` on phones: the controls join the header row above and
            order themselves. From md up they form one right-aligned group
            that wraps as a unit when the window is narrow. */}
        <div className="contents md:order-2 md:flex md:flex-1 md:flex-wrap md:items-center md:justify-end md:gap-4">

          {/* Search by app name / domain. Debounced into ?q=; Esc or the x
              clears it. 16px text on phones keeps iOS from zooming the page
              when the field is focused. */}
          <div className="order-3 md:order-2 w-full md:w-[220px] lg:w-[260px] relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              ref={searchInputRef}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              value={searchInput}
              maxLength={SEARCH_MAX_LENGTH}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && searchInput) {
                  e.preventDefault();
                  clearSearch();
                }
              }}
              placeholder={t('adminApps.searchPlaceholder')}
              aria-label={t('adminApps.searchAria')}
              className="w-full h-[40px] pl-9 pr-10 rounded-xl border border-gray-200 bg-white font-sans text-base md:text-sm text-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 [&::-webkit-search-cancel-button]:hidden"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  clearSearch();
                  searchInputRef.current?.focus();
                }}
                aria-label={t('adminApps.searchClear')}
                title={t('adminApps.searchClear')}
                className="absolute right-0 top-0 h-[40px] w-[40px] flex items-center justify-center text-gray-400 hover:text-gray-700"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}
          </div>

          {/* Active / Archived filter. Persists via ?lifecycle=... so a refresh
              keeps the operator on the restore screen. Tab labels show counts
              so the Archived tab broadcasts when there is something to restore
              even before the user clicks into it. A segmented control: full
              width with equal halves on phones, compact inline on desktop. */}
          <div
            role="tablist"
            aria-label={t('adminApps.tabsAria')}
            className="order-4 md:order-3 grid grid-cols-2 w-full md:w-auto md:inline-flex rounded-xl border border-gray-200 p-1 bg-gray-50 text-sm"
          >
            {(['active', 'archived'] as const).map((tab) => {
              const n = tab === 'active' ? activeCount : archivedCount;
              return (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={lifecycleTab === tab}
                  onClick={() => updateSearchParams({ lifecycle: tab, page: 1 })}
                  className={classNames(
                    'min-h-[40px] md:min-h-0 px-3 py-1 rounded-lg font-varela',
                    lifecycleTab === tab
                      ? 'bg-white text-brand-500 shadow-sm dark:bg-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab === 'active' ? t('adminApps.tabActive') : t('adminApps.tabArchived')}
                  {n !== null && (
                    <span className={classNames('ml-1', lifecycleTab === tab ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500')}>
                      ({numberFormatter.format(n)})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {currentUser?.isSuperAdmin && (
            <div className="order-5 md:order-4 w-full md:w-auto min-h-[40px] flex items-center">
              {renderSorting()}
            </div>
          )}
          {currentUser?.isSuperAdmin && (
            <div className="hidden md:block md:order-5">
              <CsvButton onClick={getCsvFile} />
            </div>
          )}
          {/* Create App stays as the dominant primary action in the header.
              Import lives in the closing tile of the list (CreateOrImportTile)
              so new operators don't trip into it first thing. */}
          <button
            onClick={() => setShowModal(true)}
            aria-label={t('adminApps.createApp')}
            className={classNames(
              'order-2 md:order-6 flex items-center justify-center h-[40px] bg-brand-500 rounded-xl hover:bg-brand-darker text-white text-sm font-varela',
              'w-[48px] lg:w-auto lg:px-4'
            )}
          >
            <IconAdd color="white" className="lg:mr-2" />
            <span className="hidden lg:inline">{t('adminApps.createApp')}</span>
          </button>
        </div>
      </div>

      <div id="admin-apps" className="rounded-2xl bg-white p-4 overflow-y-auto">
        {loading ? (
          <Loading />
        ) : (
          <>
            {showStarterInf && !apps.length && !urlQuery && (
              <ApplicationStarterInf onClose={() => setShowStarterInf(false)} />
            )}

            {appsState &&
              appsState.map((app) => (
                <ApplicationPreview
                  key={app._id}
                  app={app}
                  primaryColor={currentApp.primaryColor}
                  onChanged={fetchApps}
                />
              ))}

            {/* Search with no hits: say what was searched and offer the way out. */}
            {appsState && appsState.length === 0 && urlQuery && (
              <div className="flex flex-col items-center gap-3 py-12 px-2 text-center font-varela text-gray-500">
                <div className="break-words max-w-full">
                  {t('adminApps.noMatch')} &ldquo;<span className="text-gray-900">{urlQuery}</span>&rdquo;
                </div>
                <button
                  onClick={clearSearch}
                  className="h-[40px] px-5 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover text-sm font-varela"
                >
                  {t('adminApps.clearSearch')}
                </button>
              </div>
            )}

            {!loading && appsState && appsState.length === 0 && !urlQuery && lifecycleTab === 'archived' && (
              <div className="text-center text-gray-500 py-12 font-varela">
                {t('adminApps.emptyArchived')}
              </div>
            )}

            {/* Trailing tile shown only on the Active tab. Re-exposes Create
                (visual peer of an app tile so the next obvious action stays
                in flow), with Import as the muted secondary affordance. */}
            {lifecycleTab === 'active' && !urlQuery && (
              <div className="grid grid-rows-[auto,_1fr] md:grid-cols-[auto,_1fr] gap-x-4 p-4 rounded-xl border border-dashed border-gray-300 mb-4 bg-gray-50/40">
                <div className="flex justify-center items-center">
                  <div className="w-[120px] h-[120px] rounded-xl flex justify-center items-center bg-white border border-gray-200">
                    <IconAdd color="#9CA3AF" />
                  </div>
                </div>
                <div className="flex flex-col justify-center md:ml-[40px] gap-2 mt-4 md:mt-0">
                  <div className="font-varela text-[18px]">{t('adminApps.addAnotherApp')}</div>
                  <div className="font-sans text-[12px] text-gray-500 mb-2">
                    {t('adminApps.addAnotherAppDesc')}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setShowModal(true)}
                      className="flex items-center justify-center h-[40px] bg-brand-500 hover:bg-brand-darker rounded-xl text-white text-sm font-varela px-5"
                    >
                      <IconAdd color="white" className="mr-2" />
                      {t('adminApps.createApp')}
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="text-sm text-brand-500 hover:underline font-varela self-center"
                      title={t('adminApps.importTitle')}
                    >
                      {t('adminApps.importFromBundle')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <Pagination
              onPageChange={onPageChange}
              pageCount={pageCount}
              forcePage={currentPage}
            />

            {showModal && (
              <NewAppModal
                haveApps={!!apps.length}
                show={showModal}
                onClose={() => setShowModal(false)}
              />
            )}

            {newShowModal && (
              <PreviewAppModal
                haveApps={!!apps.length}
                show={newShowModal}
                onClose={() => setNewShowModal(false)}
              />
            )}

            {showImportModal && (
              <ImportAppModal
                onClose={() => setShowImportModal(false)}
                onImported={() => {
                  setShowImportModal(false);
                  fetchApps();
                }}
                doImport={httpImportApp}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
